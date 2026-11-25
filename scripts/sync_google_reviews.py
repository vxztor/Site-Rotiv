"""
Sincroniza automaticamente a nota, o total de avaliações e os comentários mais recentes
da Rotiv direto da Google Places API (New) — 100% dentro da cota gratuita mensal.

Atualiza:
  - data/reviews.json (consumido pelo site)
  - Contadores e Schema JSON-LD em index.html (para SEO)

Variáveis de ambiente necessárias (Secrets no GitHub):
  - GOOGLE_API_KEY: chave de API do Google Cloud (com Places API (New) ativada)
  - GOOGLE_PLACE_ID: Place ID do perfil da Rotiv no Google Maps
"""

import datetime
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REVIEWS_JSON = ROOT / "data" / "reviews.json"
INDEX_HTML = ROOT / "index.html"

AVATAR_COLORS = ["#4285F4", "#A142F4", "#34A853", "#EA4335", "#FBBC04", "#0E4666"]


def fetch_place_reviews(place_id: str, api_key: str) -> dict:
    url = f"https://places.googleapis.com/v1/places/{urllib.parse.quote(place_id)}?languageCode=pt-BR"
    headers = {
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        "Accept-Language": "pt-BR",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    api_key = os.environ.get("GOOGLE_API_KEY", "").strip()
    place_id = os.environ.get("GOOGLE_PLACE_ID", "").strip()
    if not api_key or not place_id:
        raise SystemExit("Erro: defina GOOGLE_API_KEY e GOOGLE_PLACE_ID nos Secrets do GitHub.")

    data = fetch_place_reviews(place_id, api_key)
    rating = round(float(data.get("rating", 5.0)), 1)
    total = int(data.get("userRatingCount", 61))

    # Carrega reviews atuais para manter fallback caso venha menos de 5 com texto
    existing = json.loads(REVIEWS_JSON.read_text(encoding="utf-8")) if REVIEWS_JSON.exists() else {}
    existing_reviews = existing.get("reviews", [])

    api_reviews = []
    for idx, rev in enumerate(data.get("reviews", [])):
        author = (rev.get("authorAttribution") or {}).get("displayName", "Cliente Rotiv").strip()
        text_obj = rev.get("text") or rev.get("originalText") or {}
        text = (text_obj.get("text") or "").strip()
        stars = int(rev.get("rating", 5))
        # Exibe apenas avaliações positivas (4 ou 5 estrelas) com texto preenchido
        if stars >= 4 and text:
            api_reviews.append({
                "author": author,
                "initial": (author[0].upper() if author else "C"),
                "color": AVATAR_COLORS[idx % len(AVATAR_COLORS)],
                "rating": stars,
                "text": text,
                "source": "Google Maps",
            })

    # Mescla com os depoimentos existentes (sem duplicar autor) para sempre manter 6 cards no carrossel
    seen = {r["author"].lower() for r in api_reviews}
    merged_reviews = list(api_reviews)
    for old_r in existing_reviews:
        if old_r.get("author", "").lower() not in seen and len(merged_reviews) < 6:
            merged_reviews.append(old_r)
            seen.add(old_r["author"].lower())

    payload = {
        "rating": rating,
        "totalReviews": total,
        "updatedAt": datetime.date.today().isoformat(),
        "reviews": merged_reviews or existing_reviews,
    }

    REVIEWS_JSON.parent.mkdir(parents=True, exist_ok=True)
    REVIEWS_JSON.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    # Atualiza os números estáticos + JSON-LD no index.html para SEO imediato
    if INDEX_HTML.exists():
        html = INDEX_HTML.read_text(encoding="utf-8")
        html = re.sub(r'"ratingCount":\s*"\d+"', f'"ratingCount": "{total}"', html)
        html = re.sub(r'"ratingValue":\s*"[\d.]+"', f'"ratingValue": "{rating:.1f}"', html)
        html = re.sub(r'(<(?:span|p)[^>]*data-reviews-rating[^>]*>)[\d.]+(</(?:span|p)>)', rf'\g<1>{rating:.1f}\g<2>', html)
        html = re.sub(r'(<span[^>]*data-reviews-count[^>]*>)\d+(</span>)', rf'\g<1>{total}\g<2>', html)
        INDEX_HTML.write_text(html, encoding="utf-8")

    print(f"Avaliações atualizadas: nota {rating:.1f} ({total} avaliações, {len(payload['reviews'])} cards).")


if __name__ == "__main__":
    main()
