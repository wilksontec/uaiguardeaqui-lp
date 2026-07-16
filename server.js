require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');
app.use(express.static('public', {
    maxAge: '30d'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    systemInstruction: `Você é um especialista em Self Storage da empresa Uai Guarde Aqui, localizada no Vale do Aço (Coronel Fabriciano, Ipatinga, Timóteo).
Sua missão é ajudar o usuário a escolher o tamanho ideal de box com base no que ele descrever.
Temos 4 opções de boxes (Lembre-se que nossos boxes têm 3 metros de altura (pé-direito), permitindo empilhamento vertical):
1. Box Micro (1m² / 3m³): Ideal para documentos, malas, itens sazonais, ou 5-8 caixas médias.
2. Box Pequeno (3m² / 9m³): Ideal para mobília de 1 cômodo pequeno, eletrodomésticos, cama de casal desmontada.
3. Box Médio (4,5m² / 13,5m³): Ideal para mudança de apartamento de 1 ou 2 quartos. Comporta móveis de sala, cozinha inteira e caixas.
4. Box Grande (6m² / 18m³): Ideal para mudança completa familiar ou estoques comerciais grandes. Equivale a um caminhão baú médio.

Analise a mensagem do usuário e recomende o box ideal. 
Sua resposta deve ser curta, direta, amigável e usar uma linguagem comercial persuasiva.
Comece recomendando o box direto e depois justifique brevemente. Formate a resposta em texto puro (sem markdown complexo, no máximo quebras de linha).`
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify SMTP Connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// --- ROUTES ---

// Home Page (Landing Page)
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'Uai Guarde Aqui | Libere espaço na sua vida',
        headerClass: 'solid-header-bg' // Header always solid for LP
    });
});

// API: AI Calculator
app.post('/api/descubra-meu-box', async (req, res) => {
    try {
        const { mensagem } = req.body;
        if (!mensagem) {
            return res.status(400).json({ error: 'Mensagem não fornecida.' });
        }
        let text = '';
        try {
            // Tenta o Gemini
            const result = await model.generateContent(mensagem);
            text = result.response.text();
        } catch (geminiError) {
            console.error('Error generating AI response (Gemini), acionando Fallback (Groq):', geminiError.message);
            // Fallback para a Groq (Llama 3)
            const systemPrompt = `Você é um especialista em Self Storage da empresa Uai Guarde Aqui, localizada no Vale do Aço (Coronel Fabriciano, Ipatinga, Timóteo).
Sua missão é ajudar o usuário a escolher o tamanho ideal de box com base no que ele descrever.
Temos 4 opções de boxes (Lembre-se que nossos boxes têm 3 metros de altura (pé-direito), permitindo empilhamento vertical):
1. Box Micro (1m² / 3m³): Ideal para documentos, malas, itens sazonais, ou 5-8 caixas médias.
2. Box Pequeno (3m² / 9m³): Ideal para mobília de 1 cômodo pequeno, eletrodomésticos, cama de casal desmontada.
3. Box Médio (4,5m² / 13,5m³): Ideal para mudança de apartamento de 1 ou 2 quartos. Comporta móveis de sala, cozinha inteira e caixas.
4. Box Grande (6m² / 18m³): Ideal para mudança completa familiar ou estoques comerciais grandes. Equivale a um caminhão baú médio.

Analise a mensagem do usuário e recomende o box ideal. 
Sua resposta deve ser curta, direta, amigável e usar uma linguagem comercial persuasiva.
Comece recomendando o box direto e depois justifique brevemente. Formate a resposta em texto puro (sem markdown complexo, no máximo quebras de linha).`;

            const groqReq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: mensagem }
                    ]
                })
            });
            const groqData = await groqReq.json();
            if (groqData.error) throw new Error(groqData.error.message);
            text = groqData.choices[0].message.content;
        }
        res.json({ recomendacao: text });
    } catch (error) {
        console.error('Final AI Error:', error);
        res.status(500).json({ error: 'Erro ao analisar os itens. Tente novamente mais tarde.' });
    }
});

// API: Lead Qualification Form
app.post('/api/lead', async (req, res) => {
    const {
        'g-recaptcha-response': recaptchaResponse,
        nome,
        email,
        telefone,
        perfil, // PF ou PJ
        necessidade, // O que precisa guardar
        prazo, // Para quando precisa
        tamanho_box, // Se já sabe o tamanho
        mensagem
    } = req.body;

    // 1. Verify reCAPTCHA
    try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaResponse}`;
        const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });
        const recaptchaData = await recaptchaRes.json();

        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            console.warn('⚠️ Alerta reCAPTCHA (Ignorado no ambiente de teste local):', recaptchaData);
            // Em produção, descomente a linha abaixo para bloquear bots reais:
            // return res.status(400).json({ success: false, message: 'Falha na verificação de segurança (Bot detectado).' });
        }
    } catch (error) {
        console.error('reCAPTCHA Error:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao verificar o captcha.' });
    }

    const leadData = {
        origem: 'Landing Page',
        nome,
        email,
        telefone,
        perfil,
        necessidade,
        tamanho_box,
        prazo,
        mensagem: mensagem || 'Não informado',
        data: new Date().toISOString()
    };

    try {
        // 2. Send Email
        const mailOptions = {
            from: `"Uai Guarde Aqui (Landing Page)" <${process.env.SMTP_USER}>`,
            to: process.env.DESTINATION_EMAIL,
            replyTo: email,
            subject: `🔥 Novo Lead Qualificado (LP): ${nome}`,
            html: `
                <h2>Novo Lead Capturado na Landing Page</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>WhatsApp:</strong> ${telefone}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <hr>
                <p><strong>Perfil:</strong> ${perfil}</p>
                <p><strong>Sabe o tamanho?</strong> ${tamanho_box}</p>
                <p><strong>O que precisa guardar:</strong> ${necessidade}</p>
                <p><strong>Prazo:</strong> ${prazo}</p>
                <hr>
                <p><strong>Mensagem Adicional:</strong><br/>${mensagem || 'Nenhuma'}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        // 3. Send to Make Webhook
        if (process.env.MAKE_WEBHOOK_URL) {
            try {
                await fetch(process.env.MAKE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });
            } catch (webhookError) {
                console.error('Error sending to Make Webhook:', webhookError);
                // Do not fail the request if webhook fails, email was already sent
            }
        }

        res.json({ success: true, message: 'Sua solicitação foi enviada com sucesso! Entraremos em contato em breve.' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ success: false, message: 'Erro ao enviar a mensagem. Tente novamente ou chame no WhatsApp.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Landing Page server running on http://localhost:${PORT}`);
});
