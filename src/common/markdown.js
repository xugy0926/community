import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import markdownItContainer from 'markdown-it-container';
import markdownItCenterText from 'markdown-it-center-text';
import markdownItBlockImage from 'markdown-it-block-image';
import logger from './logger';

// Set default options
const md = new MarkdownIt({
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
        logger.err(err);
      }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'; // use external default escaping
  },
}).use(markdownItContainer, 'spoiler', {
    validate(params) {
      return params.trim().match(/^spoiler\s+(.*)$/);
    },

    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<details><summary>${md.utils.escapeHtml(m[1])}</summary>\n`;
      }
      // closing tag
      return '</details>\n';
    },
  })
  .use(markdownItCenterText)
  .use(require('markdown-it-html5-embed'), {
    html5embed: {
      useImageSyntax: false, // Enables video/audio embed with ![]() syntax (default)
      useLinkSyntax: true // Enables video/audio embed with []() syntax
    },
  })
  .use(markdownItBlockImage, {
    outputContainer: 'div',
    containerClassName: 'image-container'
  })
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-underline'));

md.set({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true, // Enable smartypants and other sweet transforms
});

export default function(text) {
  return md.render(text || '');
}
