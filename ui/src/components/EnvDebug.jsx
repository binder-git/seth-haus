import React from 'react';

const EnvDebug = () => {
  // Get all environment variables that start with COMMERCE_LAYER_
  const envVars = Object.entries(import.meta.env)
    .filter(([key]) => key.startsWith('COMMERCE_LAYER_'))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1rem',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2>Commerce Layer Environment Variables</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#e0e0e0' }}>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Variable</th>
            <th style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {envVars.map(([key, value]) => (
            <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px', border: '1px solid #eee' }}><code>{key}</code></td>
              <td style={{ 
                padding: '8px', 
                border: '1px solid #eee',
                wordBreak: 'break-all',
                maxWidth: '500px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {value ? value.toString() : '(empty)'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnvDebug;
