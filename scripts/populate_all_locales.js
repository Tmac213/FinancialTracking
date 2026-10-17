import fs from 'fs';
import path from 'path';

const projectRoot = "c:/Users/ahmad/Downloads/Financial Tracking";
const localesDir = path.join(projectRoot, 'public', 'locales');
const enPath = path.join(localesDir, 'en.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// Translations for mintAi keys across common languages
const translations = {
  es: {
    "mintAi.title": "Asistente Mint AI",
    "mintAi.subtitle": "Registro en lenguaje natural, control de presupuesto y asesoría financiera",
    "mintAi.voiceNotSupported": "El reconocimiento de voz no es compatible con este navegador.",
    "mintAi.welcome": "👋 ¡Hola! Soy **Mint AI**, tu copiloto financiero inteligente.\n\nPuedes registrar transacciones en tu idioma (ej. *'Gasté 15$ en almuerzo usando Efectivo'*), o preguntarme sobre tus gastos, alertas y metas.",
    "mintAi.suggestion1": "Gasté 15$ en almuerzo usando Efectivo",
    "mintAi.suggestion2": "¿Cuánto he gastado en Comida este mes?",
    "mintAi.suggestion3": "Compara mis gastos con el mes pasado",
    "mintAi.suggestion4": "Resumen de salud financiera",
    "mintAi.preparedEntry": "He preparado este registro de {{type}} para ti. Revisa los detalles abajo y pulsa **Confirmar y Registrar**:",
    "mintAi.parsedTitle": "Transacción Extraída",
    "mintAi.confirmLog": "Confirmar y Registrar",
    "mintAi.cancel": "Cancelar",
    "mintAi.loggedSuccess": "¡Registrado con éxito en tu libro mayor y billetera!",
    "mintAi.placeholder": "Ej. Gasté 25$ en el supermercado con Efectivo...",
    "mintAi.footerHint": "Mint AI analiza montos, categorías y billeteras en tiempo real."
  },
  fr: {
    "mintAi.title": "Assistant Mint AI",
    "mintAi.subtitle": "Saisie en langage naturel, suivi du budget et conseils financiers",
    "mintAi.voiceNotSupported": "La reconnaissance vocale n'est pas prise en charge sur ce navigateur.",
    "mintAi.welcome": "👋 Bonjour ! Je suis **Mint AI**, votre copilote financier intelligent.\n\nVous pouvez enregistrer des dépenses dans votre langue (ex. *'Dépensé 15€ pour le déjeuner en espèces'*), ou poser des questions sur vos dépenses et objectifs !",
    "mintAi.suggestion1": "Dépensé 15€ pour le déjeuner en espèces",
    "mintAi.suggestion2": "Combien ai-je dépensé en Nourriture ce mois-ci ?",
    "mintAi.suggestion3": "Comparer les dépenses avec le mois dernier",
    "mintAi.suggestion4": "Bilan de santé financière",
    "mintAi.preparedEntry": "J'ai préparé cette entrée de {{type}} pour vous. Vérifiez les détails ci-dessous et cliquez sur **Confirmer et Enregistrer** :",
    "mintAi.parsedTitle": "Transaction Analysée",
    "mintAi.confirmLog": "Confirmer et Enregistrer",
    "mintAi.cancel": "Annuler",
    "mintAi.loggedSuccess": "Enregistré avec succès dans votre grand livre et portefeuille !",
    "mintAi.placeholder": "Ex. Dépensé 25€ pour les courses en espèces...",
    "mintAi.footerHint": "Mint AI extrait les montants, catégories et portefeuilles en temps réel."
  },
  de: {
    "mintAi.title": "Mint AI Assistent",
    "mintAi.subtitle": "Erfassung in natürlicher Sprache, Budget-Einblicke & Finanzberatung",
    "mintAi.voiceNotSupported": "Spracherkennung wird in diesem Browser nicht unterstützt.",
    "mintAi.welcome": "👋 Hallo! Ich bin **Mint AI**, Ihr intelligenter Finanz-Copilot.\n\nSie können Transaktionen in natürlicher Sprache buchen (z. B. *'15€ für Mittagessen mit Bargeld bezahlt'*) oder Fragen zu Ihren Ausgaben stellen!",
    "mintAi.suggestion1": "15€ für Mittagessen mit Bargeld bezahlt",
    "mintAi.suggestion2": "Wie viel habe ich diesen Monat für Essen ausgegeben?",
    "mintAi.suggestion3": "Ausgaben mit dem Vormonat vergleichen",
    "mintAi.suggestion4": "Finanzielle Gesundheitsübersicht",
    "mintAi.preparedEntry": "Ich habe diese {{type}}-Buchung für Sie vorbereitet. Überprüfen Sie die Details und klicken Sie auf **Bestätigen & Buchen**:",
    "mintAi.parsedTitle": "Erfasste Transaktion",
    "mintAi.confirmLog": "Bestätigen & Buchen",
    "mintAi.cancel": "Abbrechen",
    "mintAi.loggedSuccess": "Erfolgreich in Ihr Kassenbuch und Ihre Geldbörse eingetragen!",
    "mintAi.placeholder": "Z. B. 25€ für Einkäufe bar bezahlt...",
    "mintAi.footerHint": "Mint AI analysiert Beträge, Kategorien und Wallets in Echtzeit."
  },
  tr: {
    "mintAi.title": "Mint AI Asistanı",
    "mintAi.subtitle": "Doğal dille işlem kaydı, bütçe takibi ve akıllı finansal tavsiyeler",
    "mintAi.voiceNotSupported": "Ses tanıma bu tarayıcıda desteklenmiyor.",
    "mintAi.welcome": "👋 Merhaba! Ben akıllı finansal yardımcınız **Mint AI**.\n\nİşlemlerinizi doğal Türkçe ile kaydedebilir (ör. *'Nakit cüzdanla öğle yemeğine 150 TL harcadım'*), harcamalarınız ve hedefleriniz hakkında sorular sorabilirsiniz!",
    "mintAi.suggestion1": "Nakit cüzdanla öğle yemeğine 150 TL harcadım",
    "mintAi.suggestion2": "Bu ay gıdaya ne kadar harcadım?",
    "mintAi.suggestion3": "Harcamalarımı geçen ayla karşılaştır",
    "mintAi.suggestion4": "Finansal sağlık özeti",
    "mintAi.preparedEntry": "Sizin için bu {{type}} işlemini hazırladım. Aşağıdaki ayrıntıları kontrol edip **Onayla ve Kaydet** butonuna basın:",
    "mintAi.parsedTitle": "Ayrıştırılan İşlem",
    "mintAi.confirmLog": "Onayla ve Kaydet",
    "mintAi.cancel": "İptal",
    "mintAi.loggedSuccess": "İşlem defterinize ve cüzdanınıza başarıyla kaydedildi!",
    "mintAi.placeholder": "Ör. Nakit olarak markete 250 TL harcadım...",
    "mintAi.footerHint": "Mint AI tutarları, kategorileri ve cüzdanları anında ayrıştırır."
  },
  ru: {
    "mintAi.title": "Ассистент Mint AI",
    "mintAi.subtitle": "Запись расходов на обычном языке, контроль бюджета и советы",
    "mintAi.voiceNotSupported": "Распознавание речи не поддерживается в этом браузере.",
    "mintAi.welcome": "👋 Привет! Я **Mint AI**, ваш умный финансовый помощник.\n\nВы можете записывать операции обычным языком (например: *'Потратил 1500 руб на обед из наличных'*), или спрашивать о бюджете и расходах!",
    "mintAi.suggestion1": "Потратил 1500 руб на обед из наличных",
    "mintAi.suggestion2": "Сколько я потратил на еду в этом месяце?",
    "mintAi.suggestion3": "Сравнить расходы с прошлым месяцем",
    "mintAi.suggestion4": "Финансовый отчет и здоровье",
    "mintAi.preparedEntry": "Я подготовил запись ({{type}}). Проверьте данные и нажмите **Подтвердить и записать**:",
    "mintAi.parsedTitle": "Распознанная операция",
    "mintAi.confirmLog": "Подтвердить и записать",
    "mintAi.cancel": "Отмена",
    "mintAi.loggedSuccess": "Операция успешно добавлена в журнал и кошелек!",
    "mintAi.placeholder": "Например: Потратил 500 руб на продукты наличными...",
    "mintAi.footerHint": "Mint AI автоматически распознает сумму, категорию и кошелек."
  },
  id: {
    "mintAi.title": "Asisten Mint AI",
    "mintAi.subtitle": "Pencatatan bahasa alami, wawasan anggaran & nasihat keuangan",
    "mintAi.voiceNotSupported": "Pengenalan suara tidak didukung di peramban ini.",
    "mintAi.welcome": "👋 Halo! Saya **Mint AI**, asisten keuangan pintar Anda.\n\nAnda dapat mencatat transaksi menggunakan bahasa sehari-hari (contoh: *'Habis 15 ribu untuk makan siang pakai Dompet Tunai'*), atau bertanya seputar pengeluaran & tabungan!",
    "mintAi.suggestion1": "Habis 15 ribu untuk makan siang pakai Dompet Tunai",
    "mintAi.suggestion2": "Berapa banyak pengeluaran makanan bulan ini?",
    "mintAi.suggestion3": "Bandingkan pengeluaran dengan bulan lalu",
    "mintAi.suggestion4": "Ringkasan kesehatan finansial",
    "mintAi.preparedEntry": "Saya telah menyiapkan catatan {{type}} ini. Periksa detail di bawah dan klik **Konfirmasi & Catat**:",
    "mintAi.parsedTitle": "Transaksi Terdeteksi",
    "mintAi.confirmLog": "Konfirmasi & Catat",
    "mintAi.cancel": "Batal",
    "mintAi.loggedSuccess": "Berhasil dicatat ke buku kas dan dompet Anda!",
    "mintAi.placeholder": "Contoh: Beli bensin 50 ribu pakai tunai...",
    "mintAi.footerHint": "Mint AI membaca nominal, kategori, dan dompet secara langsung."
  },
  ja: {
    "mintAi.title": "Mint AI アシスタント",
    "mintAi.subtitle": "自然言語での入力、予算分析、スマートな財務アドバイス",
    "mintAi.voiceNotSupported": "このブラウザでは音声認識がサポートされていません。",
    "mintAi.welcome": "👋 こんにちは！AI財務アシスタント **Mint AI** です。\n\n自然な言葉で支出を記録したり（例:「*現金でランチに1500円使った*」）、今月の出費状況や貯蓄目標について質問できます！",
    "mintAi.suggestion1": "現金でランチに1500円使った",
    "mintAi.suggestion2": "今月の食費はいくら？",
    "mintAi.suggestion3": "先月と支出を比較して",
    "mintAi.suggestion4": "財務の健康診断",
    "mintAi.preparedEntry": "この{{type}}の記録を準備しました。内容を確認して**確認して記録**を押してください：",
    "mintAi.parsedTitle": "解析された取引",
    "mintAi.confirmLog": "確認して記録",
    "mintAi.cancel": "キャンセル",
    "mintAi.loggedSuccess": "台帳とウォレットに正常に記録されました！",
    "mintAi.placeholder": "例: 現金でコーヒーに500円使った...",
    "mintAi.footerHint": "Mint AIが金額、カテゴリ、ウォレットをリアルタイムで解析します。"
  },
  ko: {
    "mintAi.title": "Mint AI 어시스턴트",
    "mintAi.subtitle": "자연어 지출 기록, 예산 분석 및 재정 조언",
    "mintAi.voiceNotSupported": "이 브라우저에서는 음성 인식이 지원되지 않습니다.",
    "mintAi.welcome": "👋 안녕하세요! 스마트 금융 비서 **Mint AI**입니다.\n\n자연스러운 일상어로 거래를 기록하거나(예: *'현금으로 점심 15000원 지출'*), 이번 달 지출 현황과 예산에 대해 물어보세요!",
    "mintAi.suggestion1": "현금으로 점심 15000원 지출",
    "mintAi.suggestion2": "이번 달 식비로 얼마나 썼어?",
    "mintAi.suggestion3": "지난달과 지출 비교해줘",
    "mintAi.suggestion4": "재정 건강 상태 요약",
    "mintAi.preparedEntry": "이 {{type}} 내역을 작성했습니다. 아래 세부 정보를 확인하고 **확인 및 기록**을 누르세요:",
    "mintAi.parsedTitle": "추출된 거래 내역",
    "mintAi.confirmLog": "확인 및 기록",
    "mintAi.cancel": "취소",
    "mintAi.loggedSuccess": "가계부와 지갑에 성공적으로 기록되었습니다!",
    "mintAi.placeholder": "예: 편의점에서 현금으로 5000원 결제...",
    "mintAi.footerHint": "Mint AI가 금액, 카테고리, 지갑을 실시간으로 분석합니다."
  },
  it: {
    "mintAi.title": "Assistente Mint AI",
    "mintAi.subtitle": "Registrazione in linguaggio naturale, analisi del budget e consigli",
    "mintAi.voiceNotSupported": "Il riconoscimento vocale non è supportato in questo browser.",
    "mintAi.welcome": "👋 Ciao! Sono **Mint AI**, il tuo copilota finanziario intelligente.\n\nPuoi registrare transazioni in linguaggio naturale o farmi domande su spese e budget!",
    "mintAi.suggestion1": "Spesi 15€ per il pranzo in contanti",
    "mintAi.suggestion2": "Quanto ho speso per il cibo questo mese?",
    "mintAi.suggestion3": "Confronta le spese con il mese scorso",
    "mintAi.suggestion4": "Riepilogo della salute finanziaria",
    "mintAi.preparedEntry": "Ho preparato questa voce di {{type}} per te. Controlla i dettagli e clicca su **Conferma e Registra**:",
    "mintAi.parsedTitle": "Transazione Estratta",
    "mintAi.confirmLog": "Conferma e Registra",
    "mintAi.cancel": "Annulla",
    "mintAi.loggedSuccess": "Registrato con successo nel registro e nel portafoglio!",
    "mintAi.placeholder": "Es. Spesi 25€ al supermercato in contanti...",
    "mintAi.footerHint": "Mint AI rileva importi, categorie e portafogli in tempo reale."
  },
  pt: {
    "mintAi.title": "Assistente Mint AI",
    "mintAi.subtitle": "Registro em linguagem natural, controle de orçamento e conselhos",
    "mintAi.voiceNotSupported": "O reconhecimento de voz não é suportado neste navegador.",
    "mintAi.welcome": "👋 Olá! Sou o **Mint AI**, seu copiloto financeiro inteligente.\n\nVocê pode registrar transações em linguagem natural ou fazer perguntas sobre seus gastos e metas!",
    "mintAi.suggestion1": "Gastei 15€ no almoço em dinheiro",
    "mintAi.suggestion2": "Quanto gastei com alimentação este mês?",
    "mintAi.suggestion3": "Comparar gastos com o mês passado",
    "mintAi.suggestion4": "Resumo da saúde financeira",
    "mintAi.preparedEntry": "Preparei este registro de {{type}} para você. Revise abaixo e clique em **Confirmar e Salvar**:",
    "mintAi.parsedTitle": "Transação Identificada",
    "mintAi.confirmLog": "Confirmar e Salvar",
    "mintAi.cancel": "Cancelar",
    "mintAi.loggedSuccess": "Registrado com sucesso no seu livro-razão e carteira!",
    "mintAi.placeholder": "Ex.: Gastei 25€ no mercado em dinheiro...",
    "mintAi.footerHint": "O Mint AI processa valores, categorias e contas em tempo real."
  },
  vi: {
    "mintAi.title": "Trợ lý Mint AI",
    "mintAi.subtitle": "Ghi chép bằng ngôn ngữ tự nhiên, phân tích ngân sách và tư vấn",
    "mintAi.voiceNotSupported": "Nhận dạng giọng nói không được hỗ trợ trên trình duyệt này.",
    "mintAi.welcome": "👋 Xin chào! Tôi là **Mint AI**, trợ lý tài chính thông minh của bạn.\n\nBạn có thể ghi chép chi tiêu bằng câu nói tự nhiên (ví dụ: *'Đã chi 50k ăn trưa bằng tiền mặt'*), hoặc hỏi tôi về ngân sách và mục tiêu tiết kiệm!",
    "mintAi.suggestion1": "Đã chi 50k ăn trưa bằng tiền mặt",
    "mintAi.suggestion2": "Tháng này tôi đã chi bao nhiêu cho ăn uống?",
    "mintAi.suggestion3": "So sánh chi tiêu với tháng trước",
    "mintAi.suggestion4": "Tình hình tài chính tổng quan",
    "mintAi.preparedEntry": "Tôi đã chuẩn bị giao dịch {{type}} này cho bạn. Kiểm tra chi tiết bên dưới và nhấn **Xác nhận & Lưu**:",
    "mintAi.parsedTitle": "Giao dịch đã nhận diện",
    "mintAi.confirmLog": "Xác nhận & Lưu",
    "mintAi.cancel": "Hủy",
    "mintAi.loggedSuccess": "Đã ghi nhận thành công vào sổ cái và ví của bạn!",
    "mintAi.placeholder": "VD: Mua cà phê 30k bằng tiền mặt...",
    "mintAi.footerHint": "Mint AI nhận diện số tiền, danh mục và ví theo thời gian thực."
  },
  th: {
    "mintAi.title": "ผู้ช่วย Mint AI",
    "mintAi.subtitle": "บันทึกบัญชีด้วยภาษาธรรมชาติ วิเคราะห์งบประมาณและให้คำแนะนำ",
    "mintAi.voiceNotSupported": "เบราว์เซอร์นี้ไม่รองรับการจดจำเสียง",
    "mintAi.welcome": "👋 สวัสดีครับ! ผมคือ **Mint AI** ผู้ช่วยจัดการการเงินอัจฉริยะของคุณ\n\nคุณสามารถบันทึกรายการด้วยภาษาพูดง่ายๆ หรือสอบถามยอดการใช้จ่ายและเป้าหมายการออมได้ทันที!",
    "mintAi.suggestion1": "จ่ายค่าข้าวกลางวัน 150 บาทด้วยเงินสด",
    "mintAi.suggestion2": "เดือนนี้ฉันใช้จ่ายค่าอาหารไปเท่าไหร่แล้ว?",
    "mintAi.suggestion3": "เปรียบเทียบการใช้จ่ายกับเดือนที่แล้ว",
    "mintAi.suggestion4": "สรุปสถานะสุขภาพทางการเงิน",
    "mintAi.preparedEntry": "ระบบได้เตรียมบันทึกรายการ {{type}} ให้คุณแล้ว กรุณาตรวจสอบและกด **ยืนยันและบันทึก**:",
    "mintAi.parsedTitle": "รายการที่ตรวจพบ",
    "mintAi.confirmLog": "ยืนยันและบันทึก",
    "mintAi.cancel": "ยกเลิก",
    "mintAi.loggedSuccess": "บันทึกลงในสมุดบัญชีและกระเป๋าเงินสำเร็จแล้ว!",
    "mintAi.placeholder": "เช่น จ่ายค่ากาแฟ 60 บาทด้วยเงินสด...",
    "mintAi.footerHint": "Mint AI ตรวจจับจำนวนเงิน หมวดหมู่ และกระเป๋าเงินแบบเรียลไทม์"
  },
  hi: {
    "mintAi.title": "मिंट एआई सहायक",
    "mintAi.subtitle": "प्राकृतिक भाषा में प्रविष्टि, बजट विश्लेषण और वित्तीय सलाह",
    "mintAi.voiceNotSupported": "इस ब्राउज़र में वाक् पहचान समर्थित नहीं है।",
    "mintAi.welcome": "👋 नमस्ते! मैं **Mint AI** हूँ, आपका वित्तीय साथी।\n\nआप सामान्य बोलचाल में खर्च दर्ज कर सकते हैं या अपने बजट और बचत के बारे में कोई भी प्रश्न पूछ सकते हैं!",
    "mintAi.suggestion1": "नकद से दोपहर के भोजन पर ₹150 खर्च किए",
    "mintAi.suggestion2": "इस महीने मैंने खाने पर कितना खर्च किया?",
    "mintAi.suggestion3": "पिछले महीने से खर्चों की तुलना करें",
    "mintAi.suggestion4": "वित्तीय स्थिति का सारांश",
    "mintAi.preparedEntry": "मैंने आपके लिए यह {{type}} तैयार किया है। विवरण जांचें और **पुष्टि करें और दर्ज करें** पर क्लिक करें:",
    "mintAi.parsedTitle": "पहचाना गया लेन-देन",
    "mintAi.confirmLog": "पुष्टि करें और दर्ज करें",
    "mintAi.cancel": "रद्द करें",
    "mintAi.loggedSuccess": "बहीखाते और बटुए में सफलतापूर्वक दर्ज किया गया!",
    "mintAi.placeholder": "उदा. नकद से चाय पर ₹30 खर्च किए...",
    "mintAi.footerHint": "Mint AI राशि, श्रेणी और वॉलेट को तुरंत पहचानता है।"
  },
  nl: {
    "mintAi.title": "Mint AI Assistent",
    "mintAi.subtitle": "Natuurlijke taalinvoer, budgetinzichten & financieel advies",
    "mintAi.voiceNotSupported": "Spraakherkenning wordt niet ondersteund in deze browser.",
    "mintAi.welcome": "👋 Hallo! Ik ben **Mint AI**, je slimme financiële copiloot.\n\nJe kunt transacties invoeren in gewone taal of vragen stellen over je uitgaven en doelen!",
    "mintAi.suggestion1": "15€ uitgegeven aan lunch met contant geld",
    "mintAi.suggestion2": "Hoeveel heb ik deze maand aan eten uitgegeven?",
    "mintAi.suggestion3": "Vergelijk uitgaven met vorige maand",
    "mintAi.suggestion4": "Overzicht financiële gezondheid",
    "mintAi.preparedEntry": "Ik heb deze {{type}}-invoer voor je klaargezet. Controleer de gegevens en klik op **Bevestigen & Opslaan**:",
    "mintAi.parsedTitle": "Gedetecteerde transactie",
    "mintAi.confirmLog": "Bevestigen & Opslaan",
    "mintAi.cancel": "Annuleren",
    "mintAi.loggedSuccess": "Succesvol geregistreerd in je kasboek en portemonnee!",
    "mintAi.placeholder": "Bijv. 25€ voor boodschappen contant betaald...",
    "mintAi.footerHint": "Mint AI herkent bedragen, categorieën en rekeningen direct."
  },
  pl: {
    "mintAi.title": "Asystent Mint AI",
    "mintAi.subtitle": "Zapisywanie w języku naturalnym, analiza budżetu i porady",
    "mintAi.voiceNotSupported": "Rozpoznawanie mowy nie jest obsługiwane w tej przeglądarce.",
    "mintAi.welcome": "👋 Cześć! Jestem **Mint AI**, Twoim inteligentnym asystentem finansowym.\n\nMożesz zapisywać wydatki zwykłym językiem lub pytać o stan budżetu i oszczędności!",
    "mintAi.suggestion1": "Wydano 15 zł na obiad gotówką",
    "mintAi.suggestion2": "Ile wydałem na jedzenie w tym miesiącu?",
    "mintAi.suggestion3": "Porównaj wydatki z poprzednim miesiącem",
    "mintAi.suggestion4": "Podsumowanie kondycji finansowej",
    "mintAi.preparedEntry": "Przygotowałem ten wpis ({{type}}). Sprawdź szczegóły i kliknij **Zatwierdź i zapisz**:",
    "mintAi.parsedTitle": "Rozpoznana transakcja",
    "mintAi.confirmLog": "Zatwierdź i zapisz",
    "mintAi.cancel": "Anuluj",
    "mintAi.loggedSuccess": "Pomyślnie zapisano w księdze i portfelu!",
    "mintAi.placeholder": "Np. Wydano 25 zł na zakupy gotówką...",
    "mintAi.footerHint": "Mint AI rozpoznaje kwoty, kategorie i portfele w czasie rzeczywistym."
  },
  sv: {
    "mintAi.title": "Mint AI-assistent",
    "mintAi.subtitle": "Naturligt språk, budgetinsikter & ekonomisk rådgivning",
    "mintAi.voiceNotSupported": "Röstigenkänning stöds inte i den här webbläsaren.",
    "mintAi.welcome": "👋 Hej! Jag är **Mint AI**, din intelligenta ekonomiska assistent.\n\nDu kan logga transaktioner på vanligt språk eller ställa frågor om dina utgifter och sparmål!",
    "mintAi.suggestion1": "Spenderade 150 kr på lunch med kontanter",
    "mintAi.suggestion2": "Hur mycket har jag spenderat på mat denna månad?",
    "mintAi.suggestion3": "Jämför utgifter med förra månaden",
    "mintAi.suggestion4": "Ekonomisk hälsoöversikt",
    "mintAi.preparedEntry": "Jag har förberett denna {{type}}-post åt dig. Kontrollera och klicka på **Bekräfta och spara**:",
    "mintAi.parsedTitle": "Identifierad transaktion",
    "mintAi.confirmLog": "Bekräfta och spara",
    "mintAi.cancel": "Avbryt",
    "mintAi.loggedSuccess": "Har sparats i din huvudbok och plånbok!",
    "mintAi.placeholder": "T.ex. Handlade mat för 250 kr med kontanter...",
    "mintAi.footerHint": "Mint AI tolkar belopp, kategorier och konton direkt."
  },
  "zh-TW": {
    "mintAi.title": "Mint 智能助手",
    "mintAi.subtitle": "自然語言即日記賬、預算監控與智能財務建議",
    "mintAi.voiceNotSupported": "當前瀏覽器暫不支持語音識別功能。",
    "mintAi.welcome": "👋 您好！我是您的智能財務副駕 **Mint AI**。\n\n您可以直接輸入自然語言記賬（例如：「*用現金買了25美元午餐*」），或隨時向我諮詢支出明細、預算狀態與儲蓄進度！",
    "mintAi.suggestion1": "用現金錢包支付了15美元午餐",
    "mintAi.suggestion2": "我這個月在餐飲上花了多少錢？",
    "mintAi.suggestion3": "對比我和上個月的支出情況",
    "mintAi.suggestion4": "本月財務健康體檢報告",
    "mintAi.preparedEntry": "已為您智能提取{{type}}明細，請核對下方信息並點擊**確認並記賬**：",
    "mintAi.parsedTitle": "智能解析憑單",
    "mintAi.confirmLog": "確認並記賬",
    "mintAi.cancel": "取消",
    "mintAi.loggedSuccess": "記賬成功！已同步錄入流水並更新賬戶餘額。",
    "mintAi.placeholder": "輸入自然語言，例如：用現金買了25美元午餐...",
    "mintAi.footerHint": "Mint AI 支持實時提取金額、幣種、分類與支付錢包。"
  }
};

fs.readdirSync(localesDir).forEach((file) => {
  if (!file.endsWith('.json') || file === 'en.json' || file === 'ar.json') return;
  const locale = path.basename(file, '.json');
  const localePath = path.join(localesDir, file);
  let localeData = {};
  try {
    localeData = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  } catch (e) {
    return;
  }

  const langTrans = translations[locale] || {};

  for (const key of Object.keys(enData)) {
    // If key is empty or missing, fill with specific translation or English fallback
    if (!localeData[key] || localeData[key].trim() === '') {
      if (langTrans[key]) {
        localeData[key] = langTrans[key];
      } else {
        localeData[key] = enData[key];
      }
    }
  }

  fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2) + '\n', 'utf-8');
  console.log(`Populated translations in ${file}`);
});

console.log('Finished full multilingual population.');
