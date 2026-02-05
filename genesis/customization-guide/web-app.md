# Genesis Customization: Web App

> Part of [Customization Guide](../03-CUSTOMIZATION-GUIDE.md)

---

## Change Branding

**Colors**:
Edit `templates/web-app/css/styles-template.css`:
```css
:root {
  --primary-color: #3b82f6;    /* Change to your brand color */
  --secondary-color: #8b5cf6;  /* Change to your accent color */
}
```

**Logo**:
Edit `templates/web-app/index-template.html`:
```html
<div class="logo">
  <img src="img/logo.png" alt="{{PROJECT_TITLE}}">
</div>
```

**Title**:
Already uses `{{PROJECT_TITLE}}` variable - just set it in config.

---

## Change Storage Mechanism

**From IndexedDB to LocalStorage**:

1. Edit `config.json`:
   ```json
   {
     "architecture": {
       "storage_type": "localstorage"
     }
   }
   ```

2. Update `templates/web-app/js/storage-template.js`:
   - Replace IndexedDB calls with localStorage
   - Simplify data structure (localStorage has 5-10MB limit)

**From IndexedDB to Backend API**:

1. Edit `config.json`:
   ```json
   {
     "architecture": {
       "enable_backend": true,
       "storage_type": "backend"
     }
   }
   ```

2. Generate backend templates:
   ```bash
   ./scripts/generate-backend.sh
   ```

3. Update `templates/web-app/js/storage-template.js`:
   - Replace IndexedDB calls with fetch() API calls
   - Add authentication if needed

---

## Add New Features

**Example**: Add export to PDF

1. **Add library** to `templates/web-app/index-template.html`:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
   ```

2. **Add button** to UI:
   ```html
   <button onclick="exportToPDF()">Export to PDF</button>
   ```

3. **Add function** to `templates/web-app/js/export-template.js`:
   ```javascript
   async function exportToPDF() {
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();
     // Add content...
     doc.save('{{PROJECT_NAME}}.pdf');
   }
   ```

