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
}).use(markdownItContainer, 'line', {
    validate(params) {
      return params.trim().match(/^line/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return (
          '<br>' +
          '\n' +
          '<section class="line" style="margin: 0px 0.5em 16px 0.5em">' +
          '\n' +
          '<section class="96wx-bdc" style="display: inline-block; float: left; width: 45%; margin-top: 0.2em; border: 1px dotted rgb(249, 110, 87);"></section>' +
          '\n' +
          '<section class="96wx-bdc" style="display: inline-block; float: right; width: 45%; margin-top: 0.2em; border: 1px dotted rgb(249, 110, 87);"></section>' +
          '\n' +
          '<section style="width: 0.5em; height: 0.5em; margin:auto;">' +
          '\n' +
          '<section style="-ms-transform:rotate(45deg);-moz-transform:rotate(45deg);-webkit-transform:rotate(45deg);transform:rotate(45deg);">' +
          '\n' +
          '<section class="96wx-bgc" style="width: 0.5em; height: 0.5em; background-color: rgb(249, 110, 87);">' +
          '\n' +
          '</section>' +
          '\n' +
          '</section>' +
          '\n' +
          '</section>' +
          '\n' +
          '</section>'
        );
      }
      // closing tag
      return '';
    },
  })
  .use(markdownItContainer, 'comment', {
    validate(params) {
      return params.trim().match(/^comment/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return (
          '<br>' +
          '<section class="comment" style="box-sizing: border-box; background-color: rgb(255, 255, 255);">' +
          '\n' +
          '<section style="box-sizing: border-box;">' +
          '\n' +
          '<section style="margin-top: 10px; margin-bottom: 10px; text-align: center; box-sizing: border-box;">' +
          '\n' +
          '<section style="display: inline-block; margin-bottom: 7px; margin-top: 7px; line-height: 1.2; box-sizing: border-box; background-color: rgb(249, 110, 87);">' +
          '\n' +
          '<section style="display: inline-block; vertical-align: top; border: 2px solid rgb(249, 110, 87); padding: 2px 8px; font-size: 19.2px; margin: -7px 5px; box-sizing border-box; background-color: rgb(255, 255, 255);">' +
          '\n' +
          '<p style="box-sizing: border-box;">' +
          '\n' +
          '<span style="font-family: 微软雅黑, sans-serif; text-align: center; font-size: 14px; line-height: 22.4px; color: rgb(123, 12, 0);">' +
          '\n' +
          '<br>' +
          '\n' +
          '</span>' +
          '\n' +
          '</p>' +
          '\n' +
          '<div style="box-sizing: border-box;">' +
          '\n' +
          '<div style="font-family: 微软雅黑, sans-serif; text-align: center; font-size: 14px; line-height: 22.4px; color: rgb(123, 12, 0);">'
        );
      }
      // closing tag
      return (
        '</div>' +
        '\n' +
        '</div>' +
        '\n' +
        '<p style="box-sizing: border-box;">' +
        '\n' +
        '<span style="font-family: 微软雅黑, sans-serif; text-align: center; font-size: 14px; line-height: 22.4px; color: rgb(123, 12, 0);">' +
        '\n' +
        '<br>' +
        '\n' +
        '</span>' +
        '\n' +
        '</p>' +
        '\n' +
        '<section style="box-sizing: box-sizing;">' +
        '\n' +
        '<span style="font-family: 微软雅黑, sans-serif; text-align: center; line-height: 25.6px; color: rgb(127, 127, 127);">' +
        '\n' +
        '</span>' +
        '\n' +
        '</section>' +
        '\n' +
        '</section>' +
        '\n' +
        '</section>' +
        '\n' +
        '</section>' +
        '\n' +
        '</section>' +
        '\n' +
        '</section>'
      );
    },
  })
  .use(markdownItContainer, 'info', {
    validate(params) {
      return params.trim().match(/^info/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="info">' + '\n';
      }
      // closing tag
      return '</div>\n';
    },
  })
  .use(markdownItContainer, 'success', {
    validate(params) {
      return params.trim().match(/^success/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="success">' + '\n';
      }
      // closing tag
      return '</div>\n';
    },
  })
  .use(markdownItContainer, 'warning', {
    validate(params) {
      return params.trim().match(/^warning/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="warning">' + '\n';
      }
      // closing tag
      return '</div>\n';
    },
  })
  .use(markdownItContainer, 'danger', {
    validate(params) {
      return params.trim().match(/^danger/);
    },

    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="danger">' + '\n';
      }
      // closing tag
      return '</div>\n';
    },
  })
  .use(markdownItContainer, 'spoiler', {
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
