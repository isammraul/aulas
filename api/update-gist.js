// Vercel Serverless Function para actualizar el Gist
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Manejar OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar que venga la clave de admin
  const { adminKey, data, uploadDateTime } = req.body;
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    const gistData = {
      data,
      uploadDateTime,
      timestamp: new Date().toISOString()
    };

    const jsonContent = JSON.stringify(gistData, null, 2);
    
    // Actualizar el Gist
    const response = await fetch(`https://api.github.com/gists/${process.env.GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        files: {
          'aulas-data.json': {
            content: jsonContent
          }
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      return res.status(200).json({ 
        success: true, 
        message: 'Gist actualizado correctamente',
        gistId: process.env.GIST_ID,
        url: result.html_url
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar Gist');
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar el Gist', 
      details: error.message 
    });
  }
}
