# Troubleshooting Guide

Common issues and solutions for {{PROJECT_TITLE}}.

---

## Workflow Issues

### Phase Not Advancing

**Symptoms**: Clicking "Next Phase" doesn't work

**Solutions**:
1. Ensure the current phase is completed (response saved)
2. Check browser console for JavaScript errors
3. Verify IndexedDB is working (DevTools → Application → IndexedDB)

### AI Response Not Saving

**Symptoms**: Pasting AI response doesn't save

**Solutions**:
1. Ensure response is pasted in the correct textarea
2. Click "Save Response" button explicitly
3. Check browser storage isn't full

### Export Not Working

**Symptoms**: "Export as Markdown" produces nothing

**Solutions**:
1. Ensure Phase 3 is completed
2. Check browser console for errors
3. Try a different browser

---

## Storage Issues

### Data Not Persisting

**Symptoms**: Projects disappear after closing browser

**Solutions**:
1. Check if private/incognito mode is enabled (disable it)
2. Verify IndexedDB is enabled in browser settings
3. Check storage quota isn't exceeded

### Clearing All Data

To reset the application:
1. Open DevTools (F12)
2. Go to Application → IndexedDB
3. Delete the database
4. Refresh the page

---

## UI Issues

### Dark Mode Not Working

**Symptoms**: Toggle doesn't change theme

**Solutions**:
1. Check that Tailwind CSS is loading
2. Verify `darkMode: 'class'` in Tailwind config
3. Clear browser cache

### Responsive Layout Broken

**Symptoms**: Layout issues on mobile

**Solutions**:
1. Clear browser cache
2. Check viewport meta tag in HTML
3. Test in responsive mode (DevTools → Toggle device)

---

## Development Issues

### Tests Failing

**Symptoms**: `npm test` fails

**Solutions**:
1. Ensure dependencies installed: `npm install`
2. Check Jest config: `jest.config.js`
3. Run specific test: `npm test -- --testPathPattern=<file>`

### Lint Errors

**Symptoms**: `npm run lint` shows errors

**Solutions**:
1. Run auto-fix: `npm run lint:fix`
2. Check ESLint config: `eslint.config.js`
3. Fix remaining issues manually

### Coverage Below Threshold

**Symptoms**: Tests pass but coverage fails

**Solutions**:
1. Check coverage report: `npm test -- --coverage`
2. Add tests for uncovered lines
3. Verify thresholds in `jest.config.js`

---

## Browser Compatibility

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Known Limitations

- ❌ Internet Explorer (not supported)
- ⚠️ Safari private mode (limited IndexedDB)

---

## Getting Help

1. Check [DESIGN-PATTERNS.md](./DESIGN-PATTERNS.md) for architecture patterns
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup
3. Open an issue on GitHub with:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console error messages

