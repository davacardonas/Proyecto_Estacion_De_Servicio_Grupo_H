const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const less = require('less');

const SRC = path.join(__dirname, 'src');
const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(PROJECT_ROOT, 'public');

// ---------- Helpers ----------
const icons = {
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.5l2.9 6.6 7.1.7-5.4 4.8 1.7 7-6.3-3.8-6.3 3.8 1.7-7L1.9 8.8l7.1-.7L12 1.5z"/></svg>',
  pump: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="11" height="17" rx="1.2"/><path d="M6 8h5M6 12h5M6 16h3"/><path d="M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 0 3 0v-6l-2.5-2.5"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 7.5v9M7.5 12h9"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="9.5" cy="20.5" r="1.4"/><circle cx="17.5" cy="20.5" r="1.4"/></svg>',
  fork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 2v8a2 2 0 0 0 4 0V2M8 10v12M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 4h3.5l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 4z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 4c0 1-1 1-1 2M11 4c0 1-1 1-1 2M15 4c0 1-1 1-1 2"/></svg>',
  dessert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 11h12l-1.2 8.4A2 2 0 0 1 14.8 21H9.2a2 2 0 0 1-2-1.6L6 11z"/><path d="M7 11a5 5 0 0 1 10 0"/><path d="M12 3v3M9 4.5l1 2M15 4.5l-1 2"/></svg>'
};

Handlebars.registerHelper('icon', function (name) {
  const markup = icons[name] || '';
  return new Handlebars.SafeString(markup);
});

// ---------- Register partials ----------
const partialsDir = path.join(SRC, 'templates', 'partials');
fs.readdirSync(partialsDir).forEach((file) => {
  const name = path.basename(file, '.hbs');
  const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
  Handlebars.registerPartial(name, content);
});

// ---------- Compile HTML ----------
const PAGES = [
  { template: 'layout.hbs', output: 'index.html' },
  { template: 'ubicacion.hbs', output: 'ubicacion.html' },
  { template: 'Supermercado.hbs', output: 'Supermercado.html' },
  { template: 'Restaurante.hbs', output: 'Restaurante.html' },
  { template: 'Farmacia.hbs', output: 'Farmacia.html' },
  { template: 'Nosotros.hbs', output: 'Nosotros.html' }
];

function buildHtml() {
  const data = JSON.parse(fs.readFileSync(path.join(SRC, 'data', 'data.json'), 'utf8'));
  PAGES.forEach(({ template, output }) => {
    const rootPath = path.join(SRC, 'templates', template);
    const partialPath = path.join(partialsDir, template);
    const templatePath = fs.existsSync(rootPath) ? rootPath : partialPath;
    const src = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(src);
    fs.writeFileSync(path.join(PROJECT_ROOT, output), compiled(data));
    console.log(`✔ ${output} generado en la raíz del proyecto`);
  });
}

// ---------- Compile LESS ----------
function buildCss() {
  const entry = path.join(SRC, 'styles', 'main.less');
  const src = fs.readFileSync(entry, 'utf8');
  less.render(src, { filename: entry, paths: [path.join(SRC, 'styles')] })
    .then((output) => {
      fs.writeFileSync(path.join(PUBLIC, 'styles.css'), output.css);
      console.log('✔ styles.css generado en /public');
    })
    .catch((err) => {
      console.error('✖ Error compilando LESS:', err.message);
      process.exitCode = 1;
    });
}

if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });
buildHtml();
buildCss();

