import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/j58qdf49c6w1b57xqy37z0qb1hb0xgap-chromium-131.0.6778.264/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the HTML file
    const htmlPath = path.join(__dirname, 'Creative-Flow-User-Guide.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    // Save the PDF
    fs.writeFileSync('Creative-Flow-User-Guide.pdf', pdf);
    
    await browser.close();
    console.log('PDF generated successfully: Creative-Flow-User-Guide.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

generatePDF();