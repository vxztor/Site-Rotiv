/**
 * Solicitar Orçamento — Rotiv Elétrica e Refrigeração
 * 100% nativo, rápido, sem dependências pesadas, persistência em localStorage,
 * deep-links por serviço/grupo, revisão contra bugs em PC/mobile e evento Google Ads.
 */
(function () {
    'use strict';

    const WHATSAPP_NUMBER = '5521971129223';
    const STORAGE_KEY = 'rotiv-orcamento-v1';

    // ========================================================
    // TABELA OFICIAL DE SERVIÇOS E VALORES ESTIMADOS
    // ========================================================

    const ELECTRIC_GROUPS = [
        {
            slug: 'tomadas',
            name: 'Tomadas e Interruptores',
            icon: 'fa-plug',
            items: [
                { id: 'tomada_inst', name: 'Instalação de tomada', unit: 'ponto', tierFirst: 70, tierExtra: 50, qty: true },
                { id: 'tomada_troca', name: 'Troca de tomada', unit: 'ponto', ref: 60, min: 50, max: 100, qty: true },
                { id: 'tomada_20a', name: 'Instalação de tomada 20A / ponto 220V (cooktop, forno, micro-ondas)', unit: 'ponto', ref: 100, min: 80, max: 160, qty: true },
                { id: 'tomada_10_20', name: 'Troca de tomada 10A para 20A', unit: 'ponto', ref: 65, min: 50, max: 100, qty: true },
                { id: 'interruptor_inst', name: 'Instalação de interruptor', unit: 'ponto', ref: 50, min: 50, max: 110, qty: true },
                { id: 'interruptor_troca', name: 'Troca de interruptor', unit: 'ponto', ref: 50, min: 50, max: 90, qty: true }
            ]
        },
        {
            slug: 'iluminacao',
            name: 'Iluminação',
            icon: 'fa-lightbulb',
            items: [
                { id: 'luminaria', name: 'Instalação de luminária / ponto de luz', unit: 'ponto', ref: 90, min: 65, max: 140, qty: true },
                { id: 'fita_led', name: 'Instalação de fita de LED / perfil de LED (com fonte/driver)', unit: 'metro', ref: 100, min: 85, max: 160, qty: true },
                { id: 'refletor', name: 'Instalação de refletor / holofote externo (com ou sem sensor)', unit: 'unidade', ref: 110, min: 70, max: 150, qty: true },
                { id: 'ventilador_controle', name: 'Instalação de ventilador de teto (com controle remoto)', unit: 'unidade', ref: 200, min: 160, max: 240, qty: true },
                { id: 'ventilador', name: 'Instalação de ventilador de teto (com interruptor de parede)', unit: 'unidade', ref: 300, min: 250, max: 350, qty: true }
            ]
        },
        {
            slug: 'quadro',
            name: 'Proteção, Quadros e Comandos Elétricos',
            icon: 'fa-server',
            items: [
                { id: 'disjuntor', name: 'Troca de disjuntor', unit: 'unidade', ref: 110, min: 90, max: 180, qty: true },
                { id: 'dr_dps', name: 'Instalação de DR / DPS (por módulo)', unit: 'módulo', ref: 120, min: 95, max: 170, qty: true },
                { id: 'haste_aterramento', name: 'Instalação de haste de aterramento', unit: 'ponto', ref: 160, min: 140, max: 220, qty: true },
                { id: 'qdc_organizacao', name: 'Troca de barramento / organização interna de quadro', unit: 'serviço', ref: 220, min: 160, max: 320, qty: false },
                { id: 'quadro_revisao', name: 'Revisão / atualização de quadro elétrico', unit: 'serviço', ref: 520, min: 400, max: 800, qty: false },
                { id: 'quadro_novo', name: 'Quadro elétrico novo completo (mão de obra)', unit: 'serviço', ref: 950, min: 550, max: 1500, qty: false },
                { id: 'comando_bomba', name: 'Quadro de comando para bomba d’água / boia elétrica automática', unit: 'serviço', ref: 450, min: 350, max: 850, qty: false },
                { id: 'painel_comando', name: 'Montagem de painel / quadro de comando sob medida', unit: 'projeto', qty: false, evaluate: true }
            ]
        },
        {
            slug: 'automacao',
            name: 'Automação Residencial',
            icon: 'fa-house-signal',
            items: [
                { id: 'automacao_interruptor', name: 'Instalação de interruptor inteligente (Wi-Fi)', unit: 'ponto', ref: 120, min: 80, max: 180, qty: true },
                { id: 'automacao_modulo', name: 'Instalação de módulo inteligente na caixinha (Sonoff / Zigbee)', unit: 'ponto', ref: 110, min: 80, max: 160, qty: true },
                { id: 'automacao_sensor', name: 'Instalação de sensor de presença', unit: 'unidade', ref: 95, min: 80, max: 130, qty: true },
                { id: 'automacao_tomada', name: 'Instalação de tomada inteligente', unit: 'unidade', ref: 95, min: 80, max: 130, qty: true },
                { id: 'automacao_alexa', name: 'Configuração e integração Alexa / Google Home (por ambiente)', unit: 'ambiente', ref: 90, min: 70, max: 140, qty: true },
                { id: 'fechadura_sobrepor', name: 'Instalação de fechadura digital (sobrepor)', unit: 'unidade', ref: 200, min: 150, max: 320, qty: true },
                { id: 'fechadura_embutir', name: 'Instalação de fechadura digital (embutir)', unit: 'unidade', ref: 320, min: 250, max: 480, qty: true },
                { id: 'automacao_projeto', name: 'Projeto de automação residencial (pacote completo)', unit: 'projeto', qty: false, evaluate: true }
            ]
        },
        {
            slug: 'outros',
            name: 'Outros Serviços Elétricos',
            icon: 'fa-bolt',
            items: [
                { id: 'chuveiro_resistencia', name: 'Troca de resistência de chuveiro elétrico', unit: 'unidade', ref: 70, min: 50, max: 95, qty: true },
                { id: 'chuveiro', name: 'Troca simples de chuveiro elétrico', unit: 'unidade', ref: 110, min: 80, max: 150, qty: true },
                { id: 'chuveiro_novo', name: 'Instalação de chuveiro elétrico (com fiação e disjuntor dedicados)', unit: 'unidade', ref: 220, min: 180, max: 340, qty: true },
                { id: 'diagnostico_curto', name: 'Diagnóstico de curto-circuito / disjuntor desarmando', unit: 'serviço', ref: 150, min: 100, max: 250, qty: false },
                { id: 'circuito_dedicado', name: 'Instalação de circuito dedicado', unit: 'circuito', ref: 250, min: 220, max: 450, qty: true },
                { id: 'fiacao', name: 'Passagem de fiação nova', unit: 'metro', ref: 30, min: 25, max: 55, qty: true },
                { id: 'padrao_entrada', name: 'Padrão de entrada (Padrão Light)', unit: 'serviço', qty: false, evaluate: true },
                { id: 'visita_tecnica', name: 'Visita técnica (abatida se fechar o serviço)', unit: 'visita', ref: 90, min: 70, max: 140, qty: false }
            ]
        }
    ];

    const WALLBOX_POWER = [
        { id: '7.4', label: '7,4 kW (monofásico)', base: 950, min: 700, max: 1300 },
        { id: '11', label: '11 kW (trifásico)', base: 1400, min: 1100, max: 2000 },
        { id: '22', label: '22 kW (trifásico)', base: 1800, min: 1400, max: 2600 }
    ];

    const WALLBOX_DISTANCE = [
        { id: 'ate5', label: 'Até 5 metros', extra: 0 },
        { id: '5a15', label: '5 a 15 metros', extra: 250 },
        { id: '15a30', label: '15 a 30 metros', extra: 550 },
        { id: 'mais30', label: 'Mais de 30 metros', extra: null }
    ];

    const AC_TYPES = [
        { id: 'instalacao', label: 'Instalação de Split', sub: 'A partir de R$ 500 (mão de obra — material à parte). Informe BTUs e distância', price: null },
        { id: 'higienizacao_split', label: 'Higienização de Split (desmontagem e lavagem)', sub: 'Estimativa: R$ 300 / aparelho · Eliminação de fungos, bactérias e mau cheiro', price: 300 },
        { id: 'higienizacao_janela', label: 'Higienização de Ar-Condicionado de Janela', sub: 'Estimativa: R$ 150 / aparelho · Limpeza completa e higienização', price: 150 },
        { id: 'retirada', label: 'Retirada / Desinstalação de Split', sub: 'Estimativa: R$ 240 / aparelho · Desinstalação segura com recolhimento de gás', price: 240 },
        { id: 'manutencao', label: 'Manutenção preventiva ou corretiva', sub: 'Sob avaliação técnica · Diagnóstico, gás, placa ou vazamentos', price: null }
    ];

    const AC_BTUS = [
        { id: '9-12', label: '9.000 a 12.000 BTUs', ref: 500, min: 450, max: 700, evaluate: false },
        { id: '18-24', label: '18.000 a 24.000 BTUs', ref: 750, min: 650, max: 1050, evaluate: false },
        { id: '30+', label: '30.000 BTUs ou mais', ref: 0, min: 0, max: 0, evaluate: true }
    ];

    const CITIES_SUGGESTIONS = [
        'Nova Iguaçu', 'Belford Roxo', 'Duque de Caxias', 'São João de Meriti',
        'Nilópolis', 'Mesquita', 'Queimados', 'Rio de Janeiro', 'Niterói'
    ];

    const SCREEN_TITLES = {
        electric: 'Instalações Elétricas',
        wallbox: 'Instalação de Wallbox',
        ac: 'Ar-Condicionado',
        cart: 'Meu Orçamento',
        customer: 'Seus Dados',
        summary: 'Resumo do Orçamento'
    };

    const VALID_SCREENS = ['home', 'electric', 'wallbox', 'ac', 'cart', 'customer', 'summary'];

    // ========================================================
    // ESTADO DA APLICAÇÃO
    // ========================================================

    const state = {
        screen: 'home',
        cart: [],
        expandedGroup: ELECTRIC_GROUPS[0].name,
        searchQuery: '',
        quantities: {},
        addedKey: null,
        wallStep: 0,
        wallAnswers: {},
        acType: null,
        acStep: 0,
        acAnswers: {},
        copied: false,
        confirmClear: false,
        customer: {
            name: '',
            phone: '',
            city: 'Nova Iguaçu',
            district: '',
            address: '',
            notes: '',
            noAddress: false
        }
    };

    // ========================================================
    // UTILITÁRIOS
    // ========================================================

    function money(v) {
        return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatPhone(val) {
        const digits = String(val || '').replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return digits ? '(' + digits : '';
        if (digits.length <= 6) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
        if (digits.length <= 10) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
        return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
    }

    function isCustomerValid() {
        return state.customer.name.trim().length >= 2 &&
               state.customer.phone.replace(/\D/g, '').length >= 10;
    }

    function saveDraft() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                screen: state.screen,
                cart: state.cart,
                customer: state.customer
            }));
        } catch (_) {}
    }

    function loadDraft() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.cart)) {
                state.cart = parsed.cart.filter(function (it) {
                    return it && typeof it.key === 'string' && typeof it.name === 'string' &&
                           typeof it.qty === 'number' && Number.isFinite(it.qty) && it.qty > 0;
                });
            }
            if (parsed && parsed.customer && typeof parsed.customer === 'object') {
                state.customer = {
                    name: String(parsed.customer.name || ''),
                    phone: formatPhone(parsed.customer.phone || ''),
                    city: String(parsed.customer.city || 'Nova Iguaçu'),
                    district: String(parsed.customer.district || ''),
                    address: String(parsed.customer.address || ''),
                    notes: String(parsed.customer.notes || ''),
                    noAddress: Boolean(parsed.customer.noAddress)
                };
            }
            if (parsed && typeof parsed.screen === 'string' && VALID_SCREENS.includes(parsed.screen)) {
                if (state.cart.length === 0 && ['cart', 'customer', 'summary'].includes(parsed.screen)) {
                    state.screen = 'home';
                } else if (parsed.screen === 'summary' && !isCustomerValid()) {
                    state.screen = 'customer';
                } else {
                    state.screen = parsed.screen;
                }
            }
        } catch (_) {}
    }

    function checkUrlParam() {
        const params = new URLSearchParams(window.location.search);
        const srv = (params.get('servico') || '').toLowerCase();
        const grp = (params.get('grupo') || '').toLowerCase();

        const map = {
            'eletrica': 'electric',
            'electric': 'electric',
            'wallbox': 'wallbox',
            'ar': 'ac',
            'ar-condicionado': 'ac',
            'climatizacao': 'ac'
        };

        if (grp) {
            const matchGrp = ELECTRIC_GROUPS.find(function (g) {
                return g.slug === grp || g.name.toLowerCase().includes(grp);
            });
            if (matchGrp) state.expandedGroup = matchGrp.name;
        }

        if (map[srv]) {
            navigate(map[srv], false);
            if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }

    function getTotals() {
        let total = 0;
        let count = 0;
        let hasEvaluate = false;
        state.cart.forEach(function (it) {
            total += Number(it.subtotal || 0);
            count += Number(it.qty || 0);
            if (it.evaluate) hasEvaluate = true;
        });
        return { total: total, count: count, hasEvaluate: hasEvaluate };
    }

    function getGroupedCart() {
        const groups = {};
        state.cart.forEach(function (item, index) {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push({ item: item, index: index });
        });
        return groups;
    }

    function recalculate(item) {
        const subtotal = item.evaluate
            ? 0
            : (item.tierFirst != null && item.tierExtra != null)
                ? item.tierFirst + Math.max(0, item.qty - 1) * item.tierExtra
                : item.unitPrice * item.qty;
        return Object.assign({}, item, { subtotal: subtotal });
    }

    function addItem(next, stayOnScreen) {
        const idx = state.cart.findIndex(function (it) { return it.key === next.key; });
        if (idx < 0) {
            state.cart.push(next);
        } else {
            state.cart[idx] = recalculate(Object.assign({}, state.cart[idx], {
                qty: state.cart[idx].qty + next.qty
            }));
        }
        state.confirmClear = false;
        saveDraft();

        if (stayOnScreen) {
            state.addedKey = next.key;
            render();
            window.setTimeout(function () {
                if (state.addedKey === next.key) {
                    state.addedKey = null;
                    render();
                }
            }, 1300);
        } else {
            navigate('cart');
        }
    }

    function navigate(nextScreen, scrollTop) {
        state.screen = nextScreen;
        state.confirmClear = false;
        if (nextScreen === 'wallbox') {
            state.wallStep = 0;
            state.wallAnswers = {};
        }
        if (nextScreen === 'ac') {
            state.acType = null;
            state.acStep = 0;
            state.acAnswers = {};
        }
        saveDraft();
        render();
        if (scrollTop !== false) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function goBack() {
        state.confirmClear = false;
        if (state.screen === 'wallbox' && state.wallStep > 0) {
            state.wallStep -= 1;
            render();
            return;
        }
        if (state.screen === 'ac') {
            if (state.acStep > 1) {
                state.acStep -= 1;
                render();
                return;
            }
            if (state.acType) {
                state.acType = null;
                state.acStep = 0;
                state.acAnswers = {};
                render();
                return;
            }
        }
        const backMap = {
            electric: 'home',
            wallbox: 'home',
            ac: 'home',
            cart: 'home',
            customer: 'cart',
            summary: 'customer'
        };
        navigate(backMap[state.screen] || 'home');
    }

    function copyTextSafe(text, onSuccess) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
                fallbackCopy(text, onSuccess);
            });
        } else {
            fallbackCopy(text, onSuccess);
        }
    }

    function fallbackCopy(text, onSuccess) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            onSuccess();
        } catch (_) {}
    }

    function buildWhatsAppMessage() {
        const totals = getTotals();
        const grouped = getGroupedCart();
        const c = state.customer;

        const lines = [
            'Olá, Rotiv! Montei meu pedido de orçamento pelo site:',
            '',
            '*DADOS DO CLIENTE*',
            '*Nome:* ' + c.name.trim(),
            '*Telefone:* ' + c.phone.trim(),
            '*Cidade:* ' + (c.city.trim() || 'Não informada')
        ];
        if (c.district.trim()) lines.push('*Bairro:* ' + c.district.trim());
        lines.push('*Endereço:* ' + (c.noAddress ? 'Prefiro informar pelo WhatsApp' : (c.address.trim() || 'Não informado')));
        lines.push('', '*SERVIÇOS SOLICITADOS*');

        Object.keys(grouped).forEach(function (category, idx) {
            lines.push('', '*' + (idx + 1) + '. ' + category + '*');
            grouped[category].forEach(function (entry) {
                const it = entry.item;
                lines.push('- ' + it.name + (it.qty > 1 ? ' (Qtd: ' + it.qty + ')' : ''));
                if (it.details) lines.push('  ' + it.details);
                lines.push('  Valor estimado: ' + (it.evaluate ? 'sob avaliação técnica' : money(it.subtotal)));
            });
        });

        lines.push('', '*TOTAL ESTIMADO: ' + money(totals.total) + (totals.hasEvaluate ? ' + itens sob avaliação' : '') + '*');
        if (c.notes.trim()) {
            lines.push('', '*Observações:* ' + c.notes.trim());
        }
        lines.push(
            '',
            '_Os valores acima são estimados apenas para mão de obra (materiais à parte) e podem sofrer alteração após avaliação técnica._',
            'Gostaria de confirmar o orçamento com a equipe Rotiv.'
        );
        return lines.join('\n');
    }

    // ========================================================
    // COMPONENTES DE RENDERIZAÇÃO HTML
    // ========================================================

    function renderEstimateNotice(compact) {
        return (
            '<div class="budget-estimate-notice ' + (compact ? 'mb-4' : 'mb-6') + '">' +
            '  <i class="fas fa-circle-info"></i>' +
            '  <div><strong>Valores estimados de mão de obra (material à parte):</strong> os preços abaixo são referências iniciais apenas da mão de obra técnica. Materiais (fios, disjuntores, tubulação de cobre, suportes, etc.) são à parte ou cotados após avaliação pela equipe Rotiv.</div>' +
            '</div>'
        );
    }

    function renderStepDots(total, current) {
        let html = '<div class="flex justify-center gap-2 my-4" aria-label="Etapa ' + (current + 1) + ' de ' + total + '">';
        for (let i = 0; i < total; i++) {
            const cls = i === current ? 'budget-step-dot current' : (i < current ? 'budget-step-dot done' : 'budget-step-dot');
            html += '<span class="' + cls + '"></span>';
        }
        html += '</div>';
        return html;
    }

    function renderMiniCartSidebar(totals) {
        if (state.screen === 'cart') {
            return (
                '<div class="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-md">' +
                '  <div class="flex items-center justify-between mb-2">' +
                '    <span class="text-sm font-medium text-gray-600">Total estimado</span>' +
                '    <strong class="font-heading text-2xl text-Rotiv-blue">' + money(totals.total) + (totals.hasEvaluate ? ' +' : '') + '</strong>' +
                '  </div>' +
                '  <p class="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2.5 mt-3">' +
                '    <i class="fas fa-circle-info text-Rotiv-orange mr-1"></i> ' +
                (totals.hasEvaluate
                    ? 'Valores estimados (sujeitos à avaliação técnica). Itens sob avaliação serão confirmados no WhatsApp.'
                    : 'Valor estimado de referência. O orçamento final é confirmado após avaliação técnica.') +
                '  </p>' +
                '</div>'
            );
        }

        if (state.screen === 'summary') {
            const msg = encodeURIComponent(buildWhatsAppMessage());
            const waMain = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg;
            const waAlt = 'https://api.whatsapp.com/send?phone=' + WHATSAPP_NUMBER + '&text=' + msg;
            return (
                '<div class="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-md space-y-3">' +
                '  <div class="pb-3 border-b border-gray-100">' +
                '    <p class="text-xs text-gray-500 uppercase font-heading font-bold">Pronto para enviar</p>' +
                '    <p class="text-sm text-gray-600 mt-1">Seu pedido já vai preenchido direto para o WhatsApp da Rotiv.</p>' +
                '  </div>' +
                '  <a href="' + waMain + '" target="_blank" rel="noopener noreferrer" data-action="track-whatsapp" class="budget-btn-whatsapp w-full">' +
                '    <i class="fab fa-whatsapp text-xl"></i> Enviar orçamento no WhatsApp' +
                '  </a>' +
                '  <button type="button" data-action="copy-summary" class="budget-btn-outline w-full">' +
                '    <i class="fas ' + (state.copied ? 'fa-check text-Rotiv-orange' : 'fa-copy') + '"></i> ' +
                (state.copied ? 'Resumo copiado!' : 'Copiar texto do orçamento') +
                '  </button>' +
                '  <a href="' + waAlt + '" target="_blank" rel="noopener noreferrer" data-action="track-whatsapp" class="block text-center text-xs text-Rotiv-blue hover:underline pt-1">' +
                '    Não abriu o WhatsApp? Tente este link alternativo' +
                '  </a>' +
                '</div>'
            );
        }

        let listHtml = '';
        if (state.cart.length === 0) {
            listHtml = '<p class="py-8 text-center text-xs text-gray-500">Nenhum serviço adicionado ainda. Selecione os itens ao lado para montar seu pedido de orçamento.</p>';
        } else {
            listHtml = '<div class="mt-4 max-h-72 overflow-y-auto space-y-2.5 pr-1">' +
                state.cart.map(function (it) {
                    return (
                        '<div class="flex justify-between items-start gap-3 border-b border-gray-100 pb-2.5 text-xs">' +
                        '  <span class="text-gray-700 font-medium">' + esc(it.name) + (it.qty > 1 ? ' <strong>&times;' + it.qty + '</strong>' : '') + '</span>' +
                        '  <strong class="flex-shrink-0 font-heading ' + (it.evaluate ? 'text-Rotiv-orange' : 'text-Rotiv-blue') + '">' +
                        (it.evaluate ? 'A avaliar' : money(it.subtotal)) +
                        '  </strong>' +
                        '</div>'
                    );
                }).join('') +
                '</div>' +
                '<div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">' +
                '  <span class="text-sm font-medium text-gray-600">Total estimado</span>' +
                '  <strong class="font-heading text-lg text-Rotiv-blue">' + money(totals.total) + (totals.hasEvaluate ? ' +' : '') + '</strong>' +
                '</div>' +
                '<p class="text-xs text-gray-400 mt-1">Sujeito à confirmação após avaliação técnica.</p>' +
                (state.screen === 'electric'
                    ? '<button type="button" data-action="goto-cart" class="budget-btn-primary w-full py-3 mt-4">' +
                      '  Avançar para meu orçamento <i class="fas fa-arrow-right text-xs"></i>' +
                      '</button>'
                    : '');
        }

        return (
            '<div class="sticky top-24 bg-white rounded-2xl border border-gray-200 p-5 shadow-md">' +
            '  <div class="flex items-center justify-between">' +
            '    <h2 class="font-heading font-bold text-sm text-Rotiv-blue flex items-center gap-2">' +
            '      <i class="fas fa-clipboard-list text-Rotiv-orange"></i> Meu orçamento' +
            '    </h2>' +
            '    <span class="rounded-full bg-Rotiv-orange text-white font-heading font-bold text-xs px-2.5 py-0.5">' + totals.count + '</span>' +
            '  </div>' +
            listHtml +
            '</div>'
        );
    }

    function renderHomeScreen(totals) {
        const directWa = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Olá, Rotiv! Preciso de ajuda para montar um orçamento e gostaria de explicar o que preciso.');

        return (
            '<section class="rotiv-hero rotiv-hero-blog">' +
            '  <div class="rotiv-hero-accent-line" aria-hidden="true"></div>' +
            '  <div class="rotiv-hero-bg" aria-hidden="true"></div>' +
            '  <div class="rotiv-hero-scrim" aria-hidden="true"></div>' +
            '  <div class="container mx-auto px-4 py-10 sm:py-14 relative z-10">' +
            '    <div class="max-w-3xl mx-auto text-center">' +
            '      <h1 class="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-3">' +
            '        Solicite seu Orçamento em 1 Minuto' +
            '      </h1>' +
            '      <p class="text-white text-opacity-90 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">' +
            '        Escolha o que você precisa, veja uma estimativa inicial na hora e envie seu pedido já organizado direto para o nosso WhatsApp.' +
            '      </p>' +
            '    </div>' +
            '  </div>' +
            '</section>' +

            '<div class="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">' +
            renderEstimateNotice(false) +

            '  <div class="flex flex-wrap items-center justify-between gap-2 mb-5">' +
            '    <h2 class="font-heading font-bold text-lg sm:text-xl text-Rotiv-blue">Qual serviço você precisa?</h2>' +
            '    <button type="button" data-action="open-info" class="text-xs sm:text-sm font-heading font-semibold text-Rotiv-blue hover:text-Rotiv-orange inline-flex items-center gap-1.5">' +
            '      <i class="fas fa-circle-info text-Rotiv-orange"></i> Como funcionam as estimativas?' +
            '    </button>' +
            '  </div>' +

            '  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">' +
            '    <button type="button" data-action="nav" data-screen="electric" class="budget-cat-card">' +
            '      <span class="budget-cat-icon"><i class="fa-solid fa-bolt-lightning"></i></span>' +
            '      <span class="flex-1 min-w-0">' +
            '        <span class="block font-heading font-bold text-lg text-Rotiv-blue">Instalações Elétricas</span>' +
            '        <span class="block text-sm text-gray-600 mt-1 leading-relaxed">Tomadas, iluminação, chuveiro, quadros elétricos, DR/DPS, automação e Padrão Light.</span>' +
            '        <span class="hidden lg:inline-flex items-center gap-1.5 text-xs font-heading font-bold text-Rotiv-orange mt-4">Escolher serviços <i class="fas fa-arrow-right"></i></span>' +
            '      </span>' +
            '      <i class="fas fa-chevron-right text-gray-400 budget-cat-chevron"></i>' +
            '    </button>' +

            '    <button type="button" data-action="nav" data-screen="wallbox" class="budget-cat-card">' +
            '      <span class="budget-cat-icon"><i class="fa-solid fa-charging-station"></i></span>' +
            '      <span class="flex-1 min-w-0">' +
            '        <span class="block font-heading font-bold text-lg text-Rotiv-blue">Instalação de Wallbox</span>' +
            '        <span class="block text-sm text-gray-600 mt-1 leading-relaxed">Carregadores para carros elétricos e híbridos em residências, condomínios e empresas.</span>' +
            '        <span class="hidden lg:inline-flex items-center gap-1.5 text-xs font-heading font-bold text-Rotiv-orange mt-4">Montar pedido em 4 passos <i class="fas fa-arrow-right"></i></span>' +
            '      </span>' +
            '      <i class="fas fa-chevron-right text-gray-400 budget-cat-chevron"></i>' +
            '    </button>' +

            '    <button type="button" data-action="nav" data-screen="ac" class="budget-cat-card">' +
            '      <span class="budget-cat-icon"><i class="fa-solid fa-snowflake"></i></span>' +
            '      <span class="flex-1 min-w-0">' +
            '        <span class="block font-heading font-bold text-lg text-Rotiv-blue">Ar-Condicionado</span>' +
            '        <span class="block text-sm text-gray-600 mt-1 leading-relaxed">Instalação de Split, limpeza e higienização, manutenção preventiva e reinstalação.</span>' +
            '        <span class="hidden lg:inline-flex items-center gap-1.5 text-xs font-heading font-bold text-Rotiv-orange mt-4">Escolher serviço <i class="fas fa-arrow-right"></i></span>' +
            '      </span>' +
            '      <i class="fas fa-chevron-right text-gray-400 budget-cat-chevron"></i>' +
            '    </button>' +
            '  </div>' +

            (totals.count > 0
                ? '<div class="mt-6 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
                  '  <div class="flex items-center gap-3">' +
                  '    <div class="w-10 h-10 rounded-xl bg-Rotiv-blue text-white flex items-center justify-center font-heading font-bold flex-shrink-0">' + totals.count + '</div>' +
                  '    <div>' +
                  '      <p class="font-heading font-bold text-Rotiv-blue text-sm sm:text-base">Você já tem itens no seu orçamento</p>' +
                  '      <p class="text-xs sm:text-sm text-gray-600">Estimativa atual: <strong>' + money(totals.total) + (totals.hasEvaluate ? ' + itens sob avaliação' : '') + '</strong></p>' +
                  '    </div>' +
                  '  </div>' +
                  '  <button type="button" data-action="goto-cart" class="budget-btn-primary py-3 px-6">Revisar e enviar <i class="fas fa-arrow-right"></i></button>' +
                  '</div>'
                : '') +

            '  <!-- Card destacado para quem não sabe escolher os itens -->' +
            '  <div class="mt-8 budget-help-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">' +
            '    <div class="flex items-start gap-4">' +
            '      <div class="w-12 h-12 rounded-xl bg-Rotiv-orange text-white flex items-center justify-center flex-shrink-0 text-xl">' +
            '        <i class="fab fa-whatsapp"></i>' +
            '      </div>' +
            '      <div>' +
            '        <h3 class="font-heading font-bold text-base sm:text-lg text-Rotiv-blue">Não sabe exatamente o que precisa?</h3>' +
            '        <p class="text-sm text-gray-600 mt-1 leading-relaxed">Para problemas elétricos que precisam de diagnóstico, obras completas, painéis industriais ou se preferir mandar foto/áudio, fale direto com a nossa equipe.</p>' +
            '      </div>' +
            '    </div>' +
            '    <a href="' + directWa + '" target="_blank" rel="noopener noreferrer" class="budget-btn-whatsapp w-full sm:w-auto flex-shrink-0">' +
            '      <i class="fab fa-whatsapp text-xl"></i> Chamar no WhatsApp' +
            '    </a>' +
            '  </div>' +
            '</div>'
        );
    }

    function renderElectricGroupsMarkup() {
        const q = state.searchQuery.trim().toLowerCase();
        const cartMap = {};
        state.cart.forEach(function (it) { cartMap[it.key] = it.qty; });

        const groupsHtml = ELECTRIC_GROUPS.map(function (group) {
            const filteredItems = q
                ? group.items.filter(function (it) { return it.name.toLowerCase().includes(q) || group.name.toLowerCase().includes(q); })
                : group.items;

            if (q && filteredItems.length === 0) return '';

            const isOpen = q ? true : (state.expandedGroup === group.name);

            const rowsHtml = filteredItems.map(function (item) {
                const qty = state.quantities[item.id] || 1;
                const key = 'electric:' + item.id;
                const inCartQty = cartMap[key] || 0;
                const isJustAdded = state.addedKey === key;

                let priceInfo = '';
                if (item.evaluate) {
                    priceInfo = '<span class="budget-badge-eval mt-1.5"><i class="fas fa-clipboard-check"></i> Sob avaliação técnica</span>';
                } else if (item.tierFirst != null) {
                    priceInfo = '<p class="text-xs text-gray-500 mt-1">Estimativa: <strong>' + money(item.tierFirst) + '</strong> o 1º ponto + <strong>' + money(item.tierExtra) + '</strong> cada adicional</p>';
                } else {
                    priceInfo = '<p class="text-xs text-gray-500 mt-1">Valor estimado: <strong class="text-Rotiv-blue">' + money(item.ref) + '</strong> / ' + esc(item.unit) + ' <span class="text-gray-400">(' + money(item.min) + ' a ' + money(item.max) + ')</span></p>';
                }

                return (
                    '<div class="budget-service-row">' +
                    '  <div class="min-w-0 flex-1">' +
                    '    <div class="flex flex-wrap items-center gap-2">' +
                    '      <p class="font-heading font-semibold text-sm text-gray-900">' + esc(item.name) + '</p>' +
                    (inCartQty > 0 ? '<span class="budget-badge-incart">No orçamento: ' + inCartQty + '</span>' : '') +
                    '    </div>' +
                    priceInfo +
                    '  </div>' +
                    '  <div class="flex items-center justify-end gap-2.5 flex-shrink-0">' +
                    (item.qty
                        ? '<div class="budget-qty-box">' +
                          '  <button type="button" class="budget-qty-btn" data-action="el-qty" data-id="' + item.id + '" data-delta="-1" aria-label="Diminuir quantidade"><i class="fas fa-minus"></i></button>' +
                          '  <span class="budget-qty-val">' + qty + '</span>' +
                          '  <button type="button" class="budget-qty-btn" data-action="el-qty" data-id="' + item.id + '" data-delta="1" aria-label="Aumentar quantidade"><i class="fas fa-plus"></i></button>' +
                          '</div>'
                        : '') +
                    '    <button type="button" data-action="el-add" data-id="' + item.id + '" class="budget-btn-primary min-w-28 ' + (isJustAdded ? 'budget-btn-added' : '') + '">' +
                    (isJustAdded ? '<i class="fas fa-check"></i> Adicionado' : '<i class="fas fa-plus text-xs"></i> Adicionar') +
                    '    </button>' +
                    '  </div>' +
                    '</div>'
                );
            }).join('');

            return (
                '<section class="budget-group-card">' +
                '  <button type="button" class="budget-group-header" data-action="toggle-group" data-group="' + esc(group.name) + '" aria-expanded="' + String(isOpen) + '">' +
                '    <span class="flex items-center gap-2.5"><i class="fa-solid ' + group.icon + ' text-Rotiv-orange w-5 text-center"></i> ' + esc(group.name) + '</span>' +
                '    <i class="fas fa-chevron-down text-xs text-gray-400 transition-transform ' + (isOpen ? 'rotate-180 text-Rotiv-orange' : '') + '"></i>' +
                '  </button>' +
                (isOpen ? '<div>' + rowsHtml + '</div>' : '') +
                '</section>'
            );
        }).join('');

        return groupsHtml || '<div class="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">Nenhum serviço encontrado para "' + esc(state.searchQuery) + '".</div>';
    }

    function renderElectricScreen() {
        return (
            '<div class="space-y-4">' +
            renderEstimateNotice(true) +
            '  <div class="relative">' +
            '    <i class="fas fa-search text-gray-400" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;"></i>' +
            '    <input type="search" id="el-search-input" value="' + esc(state.searchQuery) + '" placeholder="Buscar serviço elétrico (ex: tomada, chuveiro, quadro, DR...)" class="budget-input" style="padding-left:40px;">' +
            '  </div>' +
            '  <div id="el-groups-container" class="space-y-4">' + renderElectricGroupsMarkup() + '</div>' +
            '</div>'
        );
    }

    function renderWallboxScreen() {
        const step = state.wallStep;
        let title = '';
        let optionsHtml = '';

        // Resumo das etapas já escolhidas
        const pills = [];
        if (step > 0 && state.wallAnswers.power) {
            const p = WALLBOX_POWER.find(function (x) { return x.id === state.wallAnswers.power; });
            if (p) pills.push(p.label);
        }
        if (step > 1 && state.wallAnswers.circuit) {
            pills.push(state.wallAnswers.circuit === 'new' ? 'Circuito novo' : 'Circuito existente');
        }
        if (step > 2 && state.wallAnswers.distance) {
            const d = WALLBOX_DISTANCE.find(function (x) { return x.id === state.wallAnswers.distance; });
            if (d) pills.push(d.label);
        }

        if (step === 0) {
            title = '1. Qual a potência do carregador Wallbox?';
            optionsHtml = WALLBOX_POWER.map(function (p) {
                return (
                    '<button type="button" class="budget-option-btn" data-action="wall-choose" data-expected-step="0" data-key="power" data-val="' + p.id + '">' +
                    '  <div>' +
                    '    <span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">' + esc(p.label) + '</span>' +
                    '    <span class="block text-xs text-gray-500 mt-1">Estimativa de referência: <strong>' + money(p.base) + '</strong> (' + money(p.min) + ' a ' + money(p.max) + ')</span>' +
                    '  </div>' +
                    '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                    '</button>'
                );
            }).join('');
        } else if (step === 1) {
            title = '2. Já existe um circuito elétrico exclusivo para o carregador?';
            optionsHtml =
                '<button type="button" class="budget-option-btn" data-action="wall-choose" data-expected-step="1" data-key="circuit" data-val="existing">' +
                '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">Sim, já existe circuito dedicado</span><span class="block text-xs text-gray-500 mt-1">Sem acréscimo de novo quadro de proteção</span></div>' +
                '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                '</button>' +
                '<button type="button" class="budget-option-btn" data-action="wall-choose" data-expected-step="1" data-key="circuit" data-val="new">' +
                '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">Não, será necessário criar circuito novo</span><span class="block text-xs text-gray-500 mt-1">Mão de obra p/ disjuntor, DR e DPS dedicados (+ ' + money(200) + ' estimados · material à parte)</span></div>' +
                '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                '</button>';
        } else if (step === 2) {
            title = '3. Qual a distância aproximada entre o quadro elétrico e a vaga?';
            optionsHtml = WALLBOX_DISTANCE.map(function (d) {
                const sub = d.extra === null ? 'Sob avaliação técnica presencial' : (d.extra === 0 ? 'Sem custo adicional (até 5m)' : '+ ' + money(d.extra) + ' estimados');
                return (
                    '<button type="button" class="budget-option-btn" data-action="wall-choose" data-expected-step="2" data-key="distance" data-val="' + d.id + '">' +
                    '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">' + esc(d.label) + '</span><span class="block text-xs text-gray-500 mt-1">' + esc(sub) + '</span></div>' +
                    '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                    '</button>'
                );
            }).join('');
        } else {
            title = '4. Onde será realizada a instalação?';
            const locs = [
                { label: 'Garagem residencial', sub: 'Casa com acesso direto ao quadro' },
                { label: 'Condomínio', sub: 'Vaga de prédio ou condomínio (conforme normas técnicas)' },
                { label: 'Comercial / Empresa', sub: 'Estacionamento corporativo ou comércio' }
            ];
            optionsHtml = locs.map(function (l) {
                return (
                    '<button type="button" class="budget-option-btn" data-action="wall-finish" data-expected-step="3" data-loc="' + esc(l.label) + '">' +
                    '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">' + esc(l.label) + '</span><span class="block text-xs text-gray-500 mt-1">' + esc(l.sub) + '</span></div>' +
                    '  <i class="fas fa-check text-Rotiv-orange"></i>' +
                    '</button>'
                );
            }).join('');
        }

        return (
            '<div class="max-w-xl mx-auto">' +
            renderEstimateNotice(true) +
            renderStepDots(4, step) +
            (pills.length ? '<div class="budget-step-summary">' + pills.map(function (x) { return '<span class="budget-step-pill"><i class="fas fa-check text-Rotiv-orange"></i> ' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
            '  <h2 class="font-heading font-bold text-lg sm:text-xl text-Rotiv-blue mb-4">' + title + '</h2>' +
            '  <div class="space-y-3">' + optionsHtml + '</div>' +
            '</div>'
        );
    }

    function renderAcScreen() {
        if (!state.acType) {
            return (
                '<div class="max-w-xl mx-auto">' +
                renderEstimateNotice(true) +
                '  <h2 class="font-heading font-bold text-lg sm:text-xl text-Rotiv-blue mb-4">Qual serviço de ar-condicionado você precisa?</h2>' +
                '  <div class="space-y-3">' +
                AC_TYPES.map(function (t) {
                    return (
                        '<button type="button" class="budget-option-btn" data-action="ac-type" data-id="' + t.id + '" data-label="' + esc(t.label) + '">' +
                        '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">' + esc(t.label) + '</span><span class="block text-xs text-gray-500 mt-1">' + esc(t.sub) + '</span></div>' +
                        '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                        '</button>'
                    );
                }).join('') +
                '  </div>' +
                '</div>'
            );
        }

        const step = state.acStep;
        const pills = [];
        if (step > 1 && state.acAnswers.btu) {
            const b = AC_BTUS.find(function (x) { return x.id === state.acAnswers.btu; });
            if (b) pills.push(b.label);
        }
        if (step > 2 && state.acAnswers.tubing != null) {
            pills.push(Number(state.acAnswers.tubing) > 0 ? 'Tubulação acima de 3m' : 'Tubulação até 3m');
        }

        let title = '';
        let optionsHtml = '';

        if (step === 1) {
            title = '1. Qual a capacidade do aparelho Split?';
            optionsHtml = AC_BTUS.map(function (b) {
                const sub = b.evaluate ? 'Sob avaliação técnica presencial' : 'Estimativa ref.: ' + money(b.ref) + ' (' + money(b.min) + ' a ' + money(b.max) + ')';
                return (
                    '<button type="button" class="budget-option-btn" data-action="ac-choose" data-expected-step="1" data-key="btu" data-val="' + b.id + '">' +
                    '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">' + esc(b.label) + '</span><span class="block text-xs text-gray-500 mt-1">' + esc(sub) + '</span></div>' +
                    '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                    '</button>'
                );
            }).join('');
        } else if (step === 2) {
            title = '2. Distância entre a unidade interna (evaporadora) e externa (condensadora)';
            optionsHtml =
                '<button type="button" class="budget-option-btn" data-action="ac-choose" data-expected-step="2" data-key="tubing" data-val="0">' +
                '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">Até 3 metros (padrão)</span><span class="block text-xs text-gray-500 mt-1">Sem acréscimo de mão de obra (material/tubulação de cobre à parte)</span></div>' +
                '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                '</button>' +
                '<button type="button" class="budget-option-btn" data-action="ac-choose" data-expected-step="2" data-key="tubing" data-val="220">' +
                '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">Mais de 3 metros</span><span class="block text-xs text-gray-500 mt-1">Mão de obra extra de instalação (+ ' + money(220) + ' estimados · tubulação de cobre à parte)</span></div>' +
                '  <i class="fas fa-chevron-right text-Rotiv-orange"></i>' +
                '</button>';
        } else {
            title = '3. Vai precisar de instalação de suporte externo ou ponto elétrico dedicado?';
            optionsHtml =
                '<button type="button" class="budget-option-btn" data-action="ac-finish" data-expected-step="3" data-support="yes">' +
                '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">Sim, incluir mão de obra p/ suporte ou ponto elétrico</span><span class="block text-xs text-gray-500 mt-1">+ ' + money(180) + ' estimados (suporte/cabo à parte)</span></div>' +
                '  <i class="fas fa-check text-Rotiv-orange"></i>' +
                '</button>' +
                '<button type="button" class="budget-option-btn" data-action="ac-finish" data-expected-step="3" data-support="no">' +
                '  <div><span class="block font-heading font-bold text-sm sm:text-base text-Rotiv-blue">Não, local já possui suporte e ponto elétrico</span><span class="block text-xs text-gray-500 mt-1">Sem acréscimo</span></div>' +
                '  <i class="fas fa-check text-Rotiv-orange"></i>' +
                '</button>';
        }

        return (
            '<div class="max-w-xl mx-auto">' +
            renderEstimateNotice(true) +
            renderStepDots(3, step - 1) +
            (pills.length ? '<div class="budget-step-summary">' + pills.map(function (x) { return '<span class="budget-step-pill"><i class="fas fa-check text-Rotiv-orange"></i> ' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
            '  <h2 class="font-heading font-bold text-lg sm:text-xl text-Rotiv-blue mb-4">' + title + '</h2>' +
            '  <div class="space-y-3">' + optionsHtml + '</div>' +
            '</div>'
        );
    }

    function renderCartScreen() {
        const grouped = getGroupedCart();
        const categories = Object.keys(grouped);

        if (categories.length === 0) {
            return (
                '<div class="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-lg mx-auto my-8 shadow-sm">' +
                '  <div class="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4 text-2xl"><i class="fas fa-clipboard-list"></i></div>' +
                '  <h2 class="font-heading font-bold text-lg text-Rotiv-blue mb-2">Seu orçamento ainda está vazio</h2>' +
                '  <p class="text-sm text-gray-600 mb-6">Adicione serviços de Elétrica, Wallbox ou Ar-Condicionado para montar seu pedido.</p>' +
                '  <button type="button" data-action="nav" data-screen="home" class="budget-btn-primary py-3 px-6"><i class="fas fa-plus"></i> Adicionar serviços</button>' +
                '</div>'
            );
        }

        const sectionsHtml = categories.map(function (cat) {
            const itemsHtml = grouped[cat].map(function (entry) {
                const it = entry.item;
                const idx = entry.index;
                return (
                    '<div class="p-4 sm:p-5 border-b border-gray-100 last:border-0">' +
                    '  <div class="flex items-start justify-between gap-3">' +
                    '    <div class="min-w-0">' +
                    '      <p class="font-heading font-bold text-sm sm:text-base text-gray-900">' + esc(it.name) + '</p>' +
                    (it.details ? '<p class="text-xs text-gray-500 mt-1">' + esc(it.details) + '</p>' : '') +
                    '    </div>' +
                    '    <button type="button" data-action="cart-remove" data-index="' + idx + '" aria-label="Remover item" class="w-9 h-9 rounded-lg text-gray-400 hover:text-Rotiv-orange hover:bg-gray-100 flex items-center justify-center flex-shrink-0">' +
                    '      <i class="fas fa-trash-can text-sm"></i>' +
                    '    </button>' +
                    '  </div>' +
                    '  <div class="mt-3 flex items-center justify-between">' +
                    (it.allowQty
                        ? '<div class="budget-qty-box">' +
                          '  <button type="button" class="budget-qty-btn" data-action="cart-qty" data-index="' + idx + '" data-delta="-1" aria-label="Diminuir"><i class="fas fa-minus"></i></button>' +
                          '  <span class="budget-qty-val">' + it.qty + '</span>' +
                          '  <button type="button" class="budget-qty-btn" data-action="cart-qty" data-index="' + idx + '" data-delta="1" aria-label="Aumentar"><i class="fas fa-plus"></i></button>' +
                          '</div>'
                        : '<span class="text-xs font-medium text-gray-500">Quantidade: ' + it.qty + '</span>') +
                    '    <strong class="font-heading text-base ' + (it.evaluate ? 'text-Rotiv-orange' : 'text-Rotiv-blue') + '">' +
                    (it.evaluate ? 'Sob avaliação' : money(it.subtotal)) +
                    '    </strong>' +
                    '  </div>' +
                    (it.evaluateNote
                        ? '<p class="mt-2.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 flex items-start gap-2"><i class="fas fa-circle-info text-Rotiv-orange mt-0.5"></i><span>' + esc(it.evaluateNote) + '</span></p>'
                        : '') +
                    '</div>'
                );
            }).join('');

            return (
                '<section>' +
                '  <h2 class="font-heading font-bold text-xs uppercase tracking-wide text-Rotiv-blue mb-2 px-1">' + esc(cat) + '</h2>' +
                '  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">' + itemsHtml + '</div>' +
                '</section>'
            );
        }).join('');

        return (
            '<div class="space-y-5">' +
            renderEstimateNotice(true) +
            sectionsHtml +
            '  <div class="flex flex-col sm:flex-row gap-3 pt-1">' +
            '    <button type="button" data-action="nav" data-screen="home" class="budget-btn-outline flex-1 py-3">' +
            '      <i class="fas fa-plus text-xs"></i> Adicionar mais serviços' +
            '    </button>' +
            (state.confirmClear
                ? '<button type="button" data-action="confirm-clear-cart" class="budget-btn-primary py-3 px-5"><i class="fas fa-trash-can text-xs"></i> Confirmar limpeza</button>'
                : '<button type="button" data-action="ask-clear-cart" class="budget-btn-outline py-3 text-gray-500"><i class="fas fa-rotate-left text-xs"></i> Limpar orçamento</button>') +
            '  </div>' +
            '  <button type="button" data-action="goto-customer" class="budget-btn-primary budget-desktop-only w-full py-3.5 text-base">' +
            '    Continuar para meus dados <i class="fas fa-arrow-right text-sm"></i>' +
            '  </button>' +
            '</div>'
        );
    }

    function renderCustomerScreen() {
        const c = state.customer;
        const canSubmit = isCustomerValid();

        const cityChips = CITIES_SUGGESTIONS.map(function (city) {
            const active = c.city.trim().toLowerCase() === city.toLowerCase();
            return '<button type="button" data-action="pick-city" data-city="' + esc(city) + '" class="budget-city-chip ' + (active ? 'active' : '') + '">' + esc(city) + '</button>';
        }).join('');

        return (
            '<div class="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 shadow-sm space-y-4">' +
            '  <div>' +
            '    <h2 class="font-heading font-bold text-lg text-Rotiv-blue">Informe seus dados para finalizar</h2>' +
            '    <p class="text-xs sm:text-sm text-gray-500 mt-1">Essas informações vão prontas no resumo que você enviará no WhatsApp da Rotiv.</p>' +
            '  </div>' +

            '  <label class="block">' +
            '    <span class="block text-xs font-heading font-bold text-Rotiv-blue mb-1">Seu nome *</span>' +
            '    <input type="text" id="cust-name" value="' + esc(c.name) + '" placeholder="Como podemos te chamar?" class="budget-input" autocomplete="name">' +
            '  </label>' +

            '  <label class="block">' +
            '    <span class="block text-xs font-heading font-bold text-Rotiv-blue mb-1">Seu WhatsApp / Telefone *</span>' +
            '    <input type="tel" id="cust-phone" value="' + esc(c.phone) + '" placeholder="(21) 99999-9999" class="budget-input" autocomplete="tel">' +
            '  </label>' +

            '  <div>' +
            '    <label class="block">' +
            '      <span class="block text-xs font-heading font-bold text-Rotiv-blue mb-1">Cidade</span>' +
            '      <input type="text" id="cust-city" value="' + esc(c.city) + '" placeholder="Ex: Nova Iguaçu" class="budget-input">' +
            '    </label>' +
            '    <div id="city-chips-wrap" class="flex flex-wrap gap-1.5 mt-2">' + cityChips + '</div>' +
            '  </div>' +

            '  <label class="block">' +
            '    <span class="block text-xs font-heading font-bold text-Rotiv-blue mb-1">Bairro <span class="font-normal text-gray-400">(opcional)</span></span>' +
            '    <input type="text" id="cust-district" value="' + esc(c.district) + '" placeholder="Ex: Centro, Rancho Novo..." class="budget-input">' +
            '  </label>' +

            (!c.noAddress
                ? '<label class="block">' +
                  '  <span class="block text-xs font-heading font-bold text-Rotiv-blue mb-1">Rua / Condomínio <span class="font-normal text-gray-400">(opcional)</span></span>' +
                  '  <input type="text" id="cust-address" value="' + esc(c.address) + '" placeholder="Rua ou nome do condomínio" class="budget-input">' +
                  '</label>'
                : '') +

            '  <label class="flex items-center gap-2.5 py-1 cursor-pointer text-xs sm:text-sm text-gray-600">' +
            '    <input type="checkbox" id="cust-noaddress" ' + (c.noAddress ? 'checked' : '') + ' style="width:17px;height:17px;accent-color:#F47C20;">' +
            '    <span>Prefiro informar o endereço direto pelo WhatsApp</span>' +
            '  </label>' +

            '  <label class="block">' +
            '    <span class="block text-xs font-heading font-bold text-Rotiv-blue mb-1">Observações <span class="font-normal text-gray-400">(opcional)</span></span>' +
            '    <textarea id="cust-notes" rows="3" placeholder="Algum detalhe importante sobre o local ou urgência?" class="budget-input">' + esc(c.notes) + '</textarea>' +
            '  </label>' +

            '  <button type="button" id="cust-submit-btn" data-action="goto-summary" ' + (!canSubmit ? 'disabled' : '') + ' class="budget-btn-primary w-full py-3.5 text-base mt-2">' +
            '    Revisar resumo do orçamento <i class="fas fa-arrow-right text-sm"></i>' +
            '  </button>' +
            '  <p id="cust-hint" class="text-xs text-gray-500 text-center" style="display:' + (canSubmit ? 'none' : 'block') + ';">Preencha seu nome e um telefone com DDD para continuar.</p>' +
            '</div>'
        );
    }

    function renderSummaryScreen(totals) {
        const grouped = getGroupedCart();
        const c = state.customer;

        const groupsHtml = Object.keys(grouped).map(function (cat) {
            const rows = grouped[cat].map(function (entry) {
                const it = entry.item;
                return (
                    '<div class="py-2.5 border-t border-gray-100 first:border-0 first:pt-0 flex justify-between items-start gap-3 text-sm">' +
                    '  <div>' +
                    '    <p class="font-medium text-gray-900">' + esc(it.name) + (it.qty > 1 ? ' <strong>&times;' + it.qty + '</strong>' : '') + '</p>' +
                    (it.details ? '<p class="text-xs text-gray-500 mt-0.5">' + esc(it.details) + '</p>' : '') +
                    '  </div>' +
                    '  <strong class="font-heading flex-shrink-0 ' + (it.evaluate ? 'text-Rotiv-orange' : 'text-Rotiv-blue') + '">' +
                    (it.evaluate ? 'Sob avaliação' : money(it.subtotal)) +
                    '  </strong>' +
                    '</div>'
                );
            }).join('');

            return (
                '<section class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">' +
                '  <h2 class="font-heading font-bold text-xs uppercase tracking-wide text-Rotiv-blue mb-3">' + esc(cat) + '</h2>' +
                rows +
                '</section>'
            );
        }).join('');

        return (
            '<div class="space-y-4">' +
            '  <section class="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-start justify-between gap-4">' +
            '    <div>' +
            '      <h2 class="font-heading font-bold text-xs uppercase tracking-wide text-Rotiv-blue mb-1">Dados do cliente</h2>' +
            '      <p class="font-heading font-bold text-base text-gray-900">' + esc(c.name) + '</p>' +
            '      <p class="text-sm text-gray-600">' + esc(c.phone) + '</p>' +
            '      <p class="text-xs text-gray-500 mt-0.5">' + esc((c.district ? c.district + ' - ' : '') + c.city) + '</p>' +
            (c.notes ? '<p class="text-xs text-gray-600 mt-2 italic">"' + esc(c.notes) + '"</p>' : '') +
            '    </div>' +
            '    <button type="button" data-action="nav" data-screen="customer" class="text-xs font-heading font-semibold text-Rotiv-blue hover:text-Rotiv-orange underline">Editar</button>' +
            '  </section>' +

            groupsHtml +

            '  <section class="rounded-2xl bg-Rotiv-blue text-white p-6 shadow-md">' +
            '    <div class="flex items-center justify-between gap-4">' +
            '      <span class="text-sm font-medium text-white text-opacity-90">Total estimado</span>' +
            '      <strong class="font-heading text-2xl sm:text-3xl font-extrabold text-white">' + money(totals.total) + (totals.hasEvaluate ? ' +' : '') + '</strong>' +
            '    </div>' +
            (totals.hasEvaluate
                ? '<p class="text-xs text-white text-opacity-90 mt-1.5">+ itens marcados sob avaliação técnica</p>'
                : '') +
            '    <p class="text-xs text-white text-opacity-85 mt-3 leading-relaxed"><strong>Importante:</strong> os valores acima são estimados e podem sofrer alteração após avaliação técnica do local pela equipe Rotiv.</p>' +
            '  </section>' +

            '  <div class="pt-2 text-center">' +
            (state.confirmClear
                ? '<button type="button" data-action="confirm-clear-cart" class="budget-btn-primary py-2.5 px-5 text-xs">Confirmar: limpar e iniciar novo orçamento</button>'
                : '<button type="button" data-action="ask-clear-cart" class="text-xs text-gray-500 hover:text-Rotiv-blue underline">Limpar tudo e iniciar um novo orçamento</button>') +
            '  </div>' +
            '</div>'
        );
    }

    function renderMobileBottomBar(totals) {
        if (['electric', 'wallbox', 'ac'].includes(state.screen) && totals.count > 0) {
            return (
                '<div class="budget-mobile-bar lg:hidden">' +
                '  <button type="button" data-action="goto-cart" class="budget-btn-blue w-full justify-between py-3.5 px-5">' +
                '    <span class="flex items-center gap-2"><i class="fas fa-clipboard-list text-Rotiv-orange"></i> Meu orçamento (' + totals.count + ')</span>' +
                '    <span>' + money(totals.total) + (totals.hasEvaluate ? ' +' : '') + ' <i class="fas fa-arrow-right text-xs ml-1"></i></span>' +
                '  </button>' +
                '</div>'
            );
        }

        if (state.screen === 'cart' && totals.count > 0) {
            return (
                '<div class="budget-mobile-bar lg:hidden">' +
                '  <div class="flex items-center justify-between mb-2 px-1">' +
                '    <span class="text-xs font-medium text-gray-600">Total estimado <span class="text-gray-400">(sujeito à avaliação)</span></span>' +
                '    <strong class="font-heading text-lg text-Rotiv-blue">' + money(totals.total) + (totals.hasEvaluate ? ' +' : '') + '</strong>' +
                '  </div>' +
                '  <button type="button" data-action="goto-customer" class="budget-btn-primary w-full py-3.5 text-base">' +
                '    Continuar <i class="fas fa-arrow-right text-sm"></i>' +
                '  </button>' +
                '</div>'
            );
        }

        if (state.screen === 'summary') {
            const msg = encodeURIComponent(buildWhatsAppMessage());
            const waMain = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + msg;
            const waAlt = 'https://api.whatsapp.com/send?phone=' + WHATSAPP_NUMBER + '&text=' + msg;
            return (
                '<div class="budget-mobile-bar lg:hidden space-y-2">' +
                '  <a href="' + waMain + '" target="_blank" rel="noopener noreferrer" data-action="track-whatsapp" class="budget-btn-whatsapp w-full">' +
                '    <i class="fab fa-whatsapp text-xl"></i> Enviar orçamento no WhatsApp' +
                '  </a>' +
                '  <div class="flex items-center justify-between px-1 pt-0.5">' +
                '    <button type="button" data-action="copy-summary" class="text-xs font-heading font-semibold text-Rotiv-blue underline">' +
                (state.copied ? 'Resumo copiado!' : 'Copiar texto') +
                '    </button>' +
                '    <a href="' + waAlt + '" target="_blank" rel="noopener noreferrer" data-action="track-whatsapp" class="text-xs text-gray-500 underline">Link alternativo</a>' +
                '  </div>' +
                '</div>'
            );
        }

        return '';
    }

    function render() {
        const root = document.getElementById('budget-app-root');
        if (!root) return;

        const totals = getTotals();

        const headerBadge = document.getElementById('header-cart-badge');
        if (headerBadge) {
            headerBadge.textContent = String(totals.count);
            headerBadge.style.display = totals.count > 0 ? 'inline-flex' : 'none';
        }

        if (state.screen === 'home') {
            root.innerHTML = renderHomeScreen(totals);
            return;
        }

        let mainContent = '';
        if (state.screen === 'electric') mainContent = renderElectricScreen();
        else if (state.screen === 'wallbox') mainContent = renderWallboxScreen();
        else if (state.screen === 'ac') mainContent = renderAcScreen();
        else if (state.screen === 'cart') mainContent = renderCartScreen();
        else if (state.screen === 'customer') mainContent = renderCustomerScreen();
        else if (state.screen === 'summary') mainContent = renderSummaryScreen(totals);

        root.innerHTML =
            '<div class="budget-step-topbar">' +
            '  <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-3 max-w-6xl">' +
            '    <button type="button" data-action="back" class="budget-icon-btn" aria-label="Voltar">' +
            '      <i class="fas fa-arrow-left"></i>' +
            '    </button>' +
            '    <h1 class="font-heading font-bold text-base sm:text-lg text-white truncate">' + esc(SCREEN_TITLES[state.screen] || 'Orçamento') + '</h1>' +
            '    <button type="button" data-action="open-info" class="budget-icon-btn" aria-label="Sobre os valores estimados">' +
            '      <i class="fas fa-circle-info"></i>' +
            '    </button>' +
            '  </div>' +
            '</div>' +

            '<div class="container mx-auto px-4 py-6 sm:py-8 pb-36 lg:pb-14 max-w-6xl">' +
            '  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">' +
            '    <div class="lg:col-span-8 min-w-0">' + mainContent + '</div>' +
            '    <aside class="hidden lg:block lg:col-span-4">' + renderMiniCartSidebar(totals) + '</aside>' +
            '  </div>' +
            '</div>' +
            renderMobileBottomBar(totals);

        bindLiveInputs();
    }

    // ========================================================
    // EVENTOS E INTERAÇÕES (SEM PERDER FOCO NO MOBILE)
    // ========================================================

    function bindLiveInputs() {
        const searchEl = document.getElementById('el-search-input');
        if (searchEl) {
            searchEl.addEventListener('input', function (e) {
                state.searchQuery = e.target.value;
                // Atualiza apenas os grupos de serviços — nunca recria o input nem fecha teclado mobile!
                const container = document.getElementById('el-groups-container');
                if (container) {
                    container.innerHTML = renderElectricGroupsMarkup();
                }
            });
        }

        const custFields = [
            ['cust-name', 'name'],
            ['cust-phone', 'phone'],
            ['cust-city', 'city'],
            ['cust-district', 'district'],
            ['cust-address', 'address'],
            ['cust-notes', 'notes']
        ];

        custFields.forEach(function (pair) {
            const el = document.getElementById(pair[0]);
            const key = pair[1];
            if (!el) return;
            el.addEventListener('input', function (e) {
                if (key === 'phone') {
                    const formatted = formatPhone(e.target.value);
                    state.customer.phone = formatted;
                    e.target.value = formatted;
                } else {
                    state.customer[key] = e.target.value;
                }
                if (key === 'city') syncCityChipsUI();
                saveDraft();
                const ok = isCustomerValid();
                const submitBtn = document.getElementById('cust-submit-btn');
                const hint = document.getElementById('cust-hint');
                if (submitBtn) submitBtn.disabled = !ok;
                if (hint) hint.style.display = ok ? 'none' : 'block';
            });
        });

        const noAddrEl = document.getElementById('cust-noaddress');
        if (noAddrEl) {
            noAddrEl.addEventListener('change', function (e) {
                state.customer.noAddress = e.target.checked;
                if (e.target.checked) state.customer.address = '';
                saveDraft();
                render();
            });
        }
    }

    function syncCityChipsUI() {
        const val = state.customer.city.trim().toLowerCase();
        document.querySelectorAll('#city-chips-wrap .budget-city-chip').forEach(function (btn) {
            const city = (btn.getAttribute('data-city') || '').toLowerCase();
            btn.classList.toggle('active', city === val);
        });
    }

    function findElectricService(id) {
        for (let g = 0; g < ELECTRIC_GROUPS.length; g++) {
            const found = ELECTRIC_GROUPS[g].items.find(function (it) { return it.id === id; });
            if (found) return found;
        }
        return null;
    }

    document.addEventListener('click', function (e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        if (action === 'nav') {
            navigate(target.getAttribute('data-screen') || 'home');
        } else if (action === 'back') {
            goBack();
        } else if (action === 'goto-cart') {
            navigate('cart');
        } else if (action === 'goto-customer') {
            if (state.cart.length > 0) navigate('customer');
        } else if (action === 'goto-summary') {
            if (isCustomerValid()) navigate('summary');
        } else if (action === 'open-info') {
            const modal = document.getElementById('budget-info-modal');
            if (modal) modal.classList.remove('hidden');
        } else if (action === 'close-info') {
            const modal = document.getElementById('budget-info-modal');
            if (modal) modal.classList.add('hidden');
        } else if (action === 'toggle-group') {
            const grp = target.getAttribute('data-group');
            state.expandedGroup = state.expandedGroup === grp ? '' : grp;
            const container = document.getElementById('el-groups-container');
            if (container) container.innerHTML = renderElectricGroupsMarkup();
            else render();
        } else if (action === 'el-qty') {
            const id = target.getAttribute('data-id');
            const delta = parseInt(target.getAttribute('data-delta') || '0', 10);
            const curr = state.quantities[id] || 1;
            state.quantities[id] = Math.max(1, curr + delta);
            const container = document.getElementById('el-groups-container');
            if (container) container.innerHTML = renderElectricGroupsMarkup();
            else render();
        } else if (action === 'el-add') {
            const id = target.getAttribute('data-id');
            const item = findElectricService(id);
            if (!item) return;
            const qty = state.quantities[item.id] || 1;
            const subtotal = item.evaluate
                ? 0
                : (item.tierFirst != null ? item.tierFirst + Math.max(0, qty - 1) * item.tierExtra : (item.ref || 0) * qty);
            // Reseta o seletor local para 1 após adicionar para evitar soma acidental dupla
            state.quantities[item.id] = 1;
            addItem({
                key: 'electric:' + item.id,
                category: 'Elétrica',
                name: item.name,
                unit: item.unit,
                qty: qty,
                unitPrice: item.evaluate ? 0 : (item.ref || item.tierFirst || 0),
                subtotal: subtotal,
                evaluate: Boolean(item.evaluate),
                details: item.tierFirst != null ? ('1ª unidade ' + money(item.tierFirst) + ' + ' + money(item.tierExtra) + ' cada adicional') : '',
                evaluateNote: item.evaluate ? 'Preço definido após avaliação técnica do local.' : '',
                tierFirst: item.tierFirst,
                tierExtra: item.tierExtra,
                allowQty: Boolean(item.qty)
            }, true);
        } else if (action === 'wall-choose') {
            const expected = parseInt(target.getAttribute('data-expected-step') || '-1', 10);
            if (expected !== state.wallStep) return; // Protege contra duplo toque acidental
            const key = target.getAttribute('data-key');
            const val = target.getAttribute('data-val');
            state.wallAnswers[key] = val;
            state.wallStep = Math.min(3, state.wallStep + 1);
            render();
        } else if (action === 'wall-finish') {
            const expected = parseInt(target.getAttribute('data-expected-step') || '-1', 10);
            if (expected !== state.wallStep) return;
            const loc = target.getAttribute('data-loc') || 'Residencial';
            const power = WALLBOX_POWER.find(function (p) { return p.id === state.wallAnswers.power; });
            const dist = WALLBOX_DISTANCE.find(function (d) { return d.id === state.wallAnswers.distance; });
            if (!power || !dist) return;
            const newCircuit = state.wallAnswers.circuit === 'new';
            const evaluate = dist.extra === null;
            const subtotal = evaluate ? 0 : power.base + (newCircuit ? 200 : 0) + dist.extra;
            addItem({
                key: 'wallbox:' + power.id + ':' + state.wallAnswers.circuit + ':' + dist.id + ':' + loc,
                category: 'Wallbox',
                name: 'Instalação de Wallbox ' + power.label,
                unit: 'serviço',
                qty: 1,
                unitPrice: subtotal,
                subtotal: subtotal,
                evaluate: evaluate,
                details: 'Mão de obra (materiais à parte) · Distância: ' + dist.label + ' · Circuito ' + (newCircuit ? 'novo (+proteções DR/DPS)' : 'existente') + ' · Local: ' + loc,
                evaluateNote: evaluate ? 'Distância acima de 30m exige avaliação técnica presencial.' : '',
                allowQty: false
            }, false);
        } else if (action === 'ac-type') {
            const id = target.getAttribute('data-id');
            const label = target.getAttribute('data-label');
            if (id === 'instalacao') {
                state.acType = id;
                state.acStep = 1;
                render();
                return;
            }
            const acTypeObj = AC_TYPES.find(function (t) { return t.id === id; });
            const hasPrice = acTypeObj && typeof acTypeObj.price === 'number' && acTypeObj.price > 0;
            addItem({
                key: 'ac:' + id,
                category: 'Ar-Condicionado',
                name: label,
                unit: 'aparelho',
                qty: 1,
                unitPrice: hasPrice ? acTypeObj.price : 0,
                subtotal: hasPrice ? acTypeObj.price : 0,
                evaluate: !hasPrice,
                details: hasPrice ? 'Valor estimado de referência por aparelho' : '',
                evaluateNote: !hasPrice ? 'Preço confirmado pela equipe conforme modelo e condições do aparelho.' : '',
                allowQty: true
            }, false);
        } else if (action === 'ac-choose') {
            const expected = parseInt(target.getAttribute('data-expected-step') || '-1', 10);
            if (expected !== state.acStep) return;
            const key = target.getAttribute('data-key');
            const val = target.getAttribute('data-val');
            state.acAnswers[key] = val;
            state.acStep = Math.min(3, state.acStep + 1);
            render();
        } else if (action === 'ac-finish') {
            const expected = parseInt(target.getAttribute('data-expected-step') || '-1', 10);
            if (expected !== state.acStep) return;
            const support = target.getAttribute('data-support') === 'yes';
            const btu = AC_BTUS.find(function (b) { return b.id === state.acAnswers.btu; });
            if (!btu) return;
            const tubing = Number(state.acAnswers.tubing || 0);
            const supportExtra = support ? 180 : 0;
            const subtotal = btu.evaluate ? 0 : btu.ref + tubing + supportExtra;
            addItem({
                key: 'ac:install:' + btu.id + ':' + tubing + ':' + support,
                category: 'Ar-Condicionado',
                name: 'Instalação Split ' + btu.label,
                unit: 'aparelho',
                qty: 1,
                unitPrice: subtotal,
                subtotal: subtotal,
                evaluate: Boolean(btu.evaluate),
                details: 'Mão de obra (materiais à parte) · Tubulação ' + (tubing ? 'acima de 3m' : 'até 3m (padrão)') + (support ? ' · Suporte/ponto dedicado' : ''),
                evaluateNote: btu.evaluate ? 'Capacidade acima de 30.000 BTUs exige avaliação técnica presencial.' : '',
                allowQty: true
            }, false);
        } else if (action === 'cart-qty') {
            const idx = parseInt(target.getAttribute('data-index') || '0', 10);
            const delta = parseInt(target.getAttribute('data-delta') || '0', 10);
            if (state.cart[idx]) {
                state.cart[idx] = recalculate(Object.assign({}, state.cart[idx], {
                    qty: Math.max(1, state.cart[idx].qty + delta)
                }));
                saveDraft();
                render();
            }
        } else if (action === 'cart-remove') {
            const idx = parseInt(target.getAttribute('data-index') || '0', 10);
            state.cart.splice(idx, 1);
            saveDraft();
            render();
        } else if (action === 'ask-clear-cart') {
            state.confirmClear = true;
            render();
        } else if (action === 'confirm-clear-cart') {
            state.cart = [];
            state.confirmClear = false;
            state.screen = 'home';
            saveDraft();
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'pick-city') {
            const city = target.getAttribute('data-city') || 'Nova Iguaçu';
            state.customer.city = city;
            const input = document.getElementById('cust-city');
            if (input) input.value = city;
            syncCityChipsUI();
            saveDraft();
        } else if (action === 'copy-summary') {
            copyTextSafe(buildWhatsAppMessage(), function () {
                state.copied = true;
                render();
                window.setTimeout(function () { state.copied = false; render(); }, 2200);
            });
        } else if (action === 'track-whatsapp') {
            saveDraft();
            if (typeof window.gtag === 'function') {
                const totals = getTotals();
                window.gtag('event', 'generate_lead', {
                    event_category: 'Orcamento Online',
                    value: totals.total,
                    currency: 'BRL'
                });
            }
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('budget-info-modal');
            if (modal) modal.classList.add('hidden');
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        const yearEl = document.getElementById('current-year');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        loadDraft();
        checkUrlParam();
        render();
    });

})();
