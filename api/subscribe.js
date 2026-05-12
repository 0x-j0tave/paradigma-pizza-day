// api/subscribe.js — Vercel Serverless Function
// Protege sua API Key do SendGrid no servidor

export default async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { name, email } = req.body;

  // Validação básica
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // A chave fica aqui no servidor — nunca exposta ao navegador
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        list_ids: [process.env.SENDGRID_LIST_ID],
        contacts: [{ email, first_name: name || '' }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('SendGrid error:', err);
      return res.status(500).json({ error: 'Erro ao salvar contato' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
