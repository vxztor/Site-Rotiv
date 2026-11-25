"""
Sincroniza automaticamente as 4 pastas do Google Drive da Rotiv para o site:
  - Elétrica
  - Ar-Condicionado
  - Comandos Elétricos
  - Wallbox

Baixa apenas fotos novas/alteradas, converte para WebP (miniatura 400px + ampliada 1400px),
preserva rigorosamente a ordem dos arquivos (001_..., 002_...) e atualiza data/gallery.json
+ a prévia inicial em index.html.

100% gratuito via Google Drive API v3 (usando apenas GOOGLE_API_KEY com a pasta
"Galeria Site Rotiv" compartilhada como "Qualquer pessoa com o link pode ver").
"""

import html as html_lib
import io
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
GALLERY_JSON = DATA_DIR / "gallery.json"
CACHE_JSON = DATA_DIR / "drive_cache.json"
THUMBS_ROOT = ROOT / "imagens" / "galeria" / "thumbs"
FULL_ROOT = ROOT / "imagens" / "galeria" / "full"

# IDs reais das 4 subpastas criadas dentro de "Galeria Site Rotiv" no Google Drive
CATEGORIES = [
    {
        "tab": "eletrica",
        "folder": "eletrica",
        "drive_id": os.environ.get("DRIVE_FOLDER_ELETRICA", "1SCGPU3LQsu2QpuWiCHsW2zqirEvhO9hU"),
        "default_alt": "Serviço de instalação elétrica executado pela Rotiv em Nova Iguaçu e RJ",
    },
    {
        "tab": "ar-condicionado",
        "folder": "ar-condicionado",
        "drive_id": os.environ.get("DRIVE_FOLDER_AR", "1FzAlkPYL7ZNOWD2VJ3k2w9l7NhdKIH9U"),
        "default_alt": "Instalação e manutenção de ar-condicionado pela Rotiv em Nova Iguaçu e RJ",
    },
    {
        "tab": "comandos",
        "folder": "comandos-eletricos",
        "drive_id": os.environ.get("DRIVE_FOLDER_COMANDOS", "1EyDkIeK3_dr1q3zvICNjAt4OelMC_8xT"),
        "default_alt": "Montagem de quadro e comando elétrico pela Rotiv",
    },
    {
        "tab": "wallbox",
        "folder": "outros",
        "drive_id": os.environ.get("DRIVE_FOLDER_WALLBOX", "1HLNUnhCtZgOR_lX44mIfMAhBcX2U6FnH"),
        "default_alt": "Instalação de carregador Wallbox para veículo elétrico pela Rotiv RJ",
    },
]

# Se True, fotos novas SEM número no início (ex: IMG_2026.jpg) aparecem no topo.
# Se False (padrão), preservam as fotos numeradas 001..N primeiro e fotos novas entram logo após.
NEW_UNNUMBERED_FIRST = os.environ.get("NEW_UNNUMBERED_FIRST", "false").lower() == "true"


def api_get_json(url: str, api_key: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "RotivGallerySync/1.0",
            "X-Goog-Api-Key": api_key,
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def api_download_bytes(file_id: str, api_key: str) -> bytes:
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "RotivGallerySync/1.0",
            "X-Goog-Api-Key": api_key,
        },
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def list_drive_images(folder_id: str, api_key: str) -> list:
    files = []
    page_token = None
    query = f"'{folder_id}' in parents and trashed = false and mimeType contains 'image/'"
    while True:
        params = {
            "q": query,
            "fields": "nextPageToken,files(id,name,mimeType,md5Checksum,createdTime,modifiedTime)",
            "pageSize": "1000",
        }
        if page_token:
            params["pageToken"] = page_token
        url = "https://www.googleapis.com/drive/v3/files?" + urllib.parse.urlencode(params)
        data = api_get_json(url, api_key)
        files.extend(data.get("files", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return files


def sort_key_preserve_order(f: dict):
    """
    Preserva a ordem exata dos arquivos numerados (ex: 001_eletrica-01.webp, 002_...).
    Arquivos sem prefixo numérico são ordenados por data de criação.
    """
    name = f.get("name", "")
    m = re.match(r"^(\d+)[_\-\s.]", name)
    if m:
        num = int(m.group(1))
        return (1 if NEW_UNNUMBERED_FIRST else 0, num, name.lower())
    created = f.get("createdTime", "")
    if NEW_UNNUMBERED_FIRST:
        # Mais recentes primeiro no grupo 0
        return (0, -int(re.sub(r"\D", "", created)[:14] or "0"), name.lower())
    return (1, created, name.lower())


def slugify_stem(filename: str, file_id: str) -> str:
    stem = Path(filename).stem.lower()
    # Remove prefixo numérico apenas para nome de arquivo limpo se quiser, mas mantém único via file_id se necessário
    clean = re.sub(r"[^a-z0-9\-_]+", "-", stem).strip("-_")
    if not clean:
        clean = f"foto-{file_id[:8].lower()}"
    return clean


def extract_original_stem(filename: str) -> str:
    stem = Path(filename).stem.lower()
    return re.sub(r"^\d+_", "", stem)


def save_webp_pair(raw_bytes: bytes, thumb_path: Path, full_path: Path):
    im = Image.open(io.BytesIO(raw_bytes))
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        rgba = im.convert("RGBA")
        bg.paste(rgba, mask=rgba.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")

    thumb_path.parent.mkdir(parents=True, exist_ok=True)
    full_path.parent.mkdir(parents=True, exist_ok=True)

    # Full (max 1400px)
    fw, fh = im.size
    if fw > 1400:
        full_im = im.resize((1400, max(1, round(fh * (1400 / fw)))), Image.Resampling.LANCZOS)
    else:
        full_im = im
    full_im.save(full_path, format="WEBP", quality=82, method=6)

    # Thumb (max 400px no maior lado)
    max_side = max(fw, fh)
    if max_side > 400:
        scale = 400 / max_side
        thumb_im = im.resize((max(1, round(fw * scale)), max(1, round(fh * scale))), Image.Resampling.LANCZOS)
    else:
        thumb_im = im
    thumb_im.save(thumb_path, format="WEBP", quality=78, method=6)
    return thumb_im.size[0], thumb_im.size[1]


def main():
    api_key = os.environ.get("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("Erro: defina a variável de ambiente GOOGLE_API_KEY com sua chave da Google Drive API.")

    # Carrega alts já existentes para preservar SEO das fotos migradas
    existing_alts = {}
    if GALLERY_JSON.exists():
        old_data = json.loads(GALLERY_JSON.read_text(encoding="utf-8"))
        for items in old_data.values():
            for item in items:
                if item.get("stem") and item.get("alt"):
                    existing_alts[item["stem"].lower()] = item["alt"]

    cache = json.loads(CACHE_JSON.read_text(encoding="utf-8")) if CACHE_JSON.exists() else {}
    new_cache = {}
    new_gallery = {}

    for cat in CATEGORIES:
        tab = cat["tab"]
        folder = cat["folder"]
        drive_id = cat["drive_id"]
        drive_files = list_drive_images(drive_id, api_key)
        drive_files.sort(key=sort_key_preserve_order)

        print(f"[{tab}] {len(drive_files)} imagens encontradas no Google Drive.")

        cat_items = []
        valid_filenames = set()

        for f in drive_files:
            fid = f["id"]
            fname = f["name"]
            md5 = f.get("md5Checksum", f.get("modifiedTime", ""))
            orig_stem = extract_original_stem(fname)
            out_stem = slugify_stem(orig_stem if orig_stem else fname, fid)
            out_name = f"{out_stem}.webp"

            # Evita colisão se o usuário subir 2 fotos com nomes iguais
            if out_name in valid_filenames:
                out_name = f"{out_stem}-{fid[:6].lower()}.webp"
            valid_filenames.add(out_name)

            thumb_rel = f"imagens/galeria/thumbs/{folder}/{out_name}"
            full_rel = f"imagens/galeria/full/{folder}/{out_name}"
            thumb_abs = ROOT / thumb_rel
            full_abs = ROOT / full_rel

            cached = cache.get(fid)
            if cached and cached.get("md5") == md5 and thumb_abs.exists() and full_abs.exists():
                tw, th = cached["w"], cached["h"]
            else:
                print(f"  -> Baixando e otimizando WebP: {fname}")
                raw = api_download_bytes(fid, api_key)
                tw, th = save_webp_pair(raw, thumb_abs, full_abs)

            alt_text = existing_alts.get(orig_stem, cat["default_alt"])
            cat_items.append({
                "stem": orig_stem,
                "thumb": thumb_rel,
                "full": full_rel,
                "w": tw,
                "h": th,
                "alt": alt_text,
            })
            new_cache[fid] = {"md5": md5, "w": tw, "h": th, "file": out_name}

        # Remove arquivos locais que foram apagados do Google Drive
        for base_dir in (THUMBS_ROOT / folder, FULL_ROOT / folder):
            if base_dir.exists():
                for local_f in base_dir.glob("*.webp"):
                    if local_f.name not in valid_filenames:
                        print(f"  -> Removendo foto apagada do Drive: {local_f.name}")
                        local_f.unlink()

        new_gallery[tab] = cat_items

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    GALLERY_JSON.write_text(json.dumps(new_gallery, indent=2, ensure_ascii=False), encoding="utf-8")
    CACHE_JSON.write_text(json.dumps(new_cache, indent=2, ensure_ascii=False), encoding="utf-8")

    # Atualiza contadores e as 12 miniaturas iniciais no index.html para SSR/SEO instantâneo
    index_path = ROOT / "index.html"
    if index_path.exists():
        html_txt = index_path.read_text(encoding="utf-8")
        tab_labels = {
            "eletrica": "Elétrica",
            "ar-condicionado": "Ar-Condicionado",
            "comandos": "Comandos Elétricos",
            "wallbox": "Wallbox",
        }
        for tab, label in tab_labels.items():
            count = len(new_gallery[tab])
            html_txt = re.sub(
                rf'(data-tab="{tab}"[^>]*>){re.escape(label)}\s*\(\d+\)(</button>)',
                rf'\g<1>{label} ({count})\g<2>',
                html_txt,
            )
            remaining = max(0, count - 12)
            html_txt = re.sub(
                rf'(data-load-more="{tab}"[^>]*>\s*)Carregar mais fotos \(\+\d+\)',
                rf'\g<1>Carregar mais fotos (+{remaining})',
                html_txt,
            )

        # Atualiza as 12 primeiras fotos da aba Elétrica no HTML inicial
        first_12 = new_gallery["eletrica"][:12]
        cards_html = "\n".join(
            f'                        <a href="{it["full"]}" class="gallery-card js-gallery-item" '
            f'data-gallery="eletrica" data-index="{i}" aria-label="Ampliar foto: {html_lib.escape(it["alt"], quote=True)}">\n'
            f'                            <div class="gallery-card-frame">\n'
            f'                                <img src="{it["thumb"]}" alt="{html_lib.escape(it["alt"], quote=True)}" '
            f'width="{it["w"]}" height="{it["h"]}" loading="lazy" decoding="async">\n'
            f'                            </div>\n'
            f'                        </a>'
            for i, it in enumerate(first_12)
        )
        html_txt = re.sub(
            r'(<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" data-grid="eletrica">).*?(</div>\s*<div class="text-center mt-6 sm:mt-8">)',
            rf'\1\n{cards_html}\n                    \2',
            html_txt,
            flags=re.DOTALL,
        )
        index_path.write_text(html_txt, encoding="utf-8")

    print("Sincronização da galeria concluída com sucesso!")


if __name__ == "__main__":
    main()
