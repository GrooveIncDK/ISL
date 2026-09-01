// ============================================================
// ISL — shared inline-comment rendering, used by both the tutor
// marking page (mark-work.html, interactive: select text, add a
// comment) and the Course Room (read-only: show a student their
// tutor's comments on what they wrote).
//
// A comment is {id, start_offset, end_offset, quoted_text, comment_text}
// — a plain-text character range into progress.reflection_text, plus
// a snapshot of the highlighted excerpt itself so a comment can still
// be found (by searching for quoted_text) if the student edits their
// text after a comment was made and the offsets drift.
//
// Include this file after supabase-client.js on any page that needs
// it. It has no dependency on supabase-client.js itself — pure text
// utilities plus small HTML renderers.
// ============================================================

function islEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// Converts a DOM (node, offset) boundary — e.g. from a Selection/Range
// — into a plain-text character offset relative to `root`, by walking
// every text node under `root` in document order. Used so a mouse
// selection inside rendered (already-annotated) HTML still maps back
// to the right offset into the ORIGINAL plain text.
function islGetTextOffset(root, node, offset) {
  let total = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let n;
  while ((n = walker.nextNode())) {
    if (n === node) return total + offset;
    total += n.textContent.length;
  }
  return total;
}

// Resolves each comment's range against the CURRENT text. If the
// stored offsets still point at the stored quoted_text, use them as-is;
// otherwise search for the quoted_text elsewhere in the text (the
// student edited something before it); if it can't be found at all,
// mark the comment orphaned so it's still shown, just not anchored.
function islResolveComments(text, comments) {
  return comments.map(c => {
    const exact = c.quoted_text != null && text.slice(c.start_offset, c.end_offset) === c.quoted_text;
    if (exact) return Object.assign({}, c, { resolvedStart: c.start_offset, resolvedEnd: c.end_offset, orphaned: false });
    const idx = c.quoted_text ? text.indexOf(c.quoted_text) : -1;
    if (idx !== -1) return Object.assign({}, c, { resolvedStart: idx, resolvedEnd: idx + c.quoted_text.length, orphaned: false });
    return Object.assign({}, c, { resolvedStart: -1, resolvedEnd: -1, orphaned: true });
  });
}

// Builds highlighted HTML for `text` from resolved comments (see
// islResolveComments). Mutates each anchorable comment with a 1-based
// `index` so a matching footnote list can cross-reference it.
// Overlapping ranges are clipped rather than allowed to break markup.
function islRenderAnnotated(text, resolvedComments) {
  const anchorable = resolvedComments.filter(c => !c.orphaned).sort((a, b) => a.resolvedStart - b.resolvedStart);
  let html = '';
  let cursor = 0;
  let n = 0;
  anchorable.forEach(c => {
    const start = Math.max(c.resolvedStart, cursor);
    const end = c.resolvedEnd;
    if (end <= start) { c.index = null; return; }
    n += 1;
    c.index = n;
    html += islEsc(text.slice(cursor, start));
    html += '<mark class="isl-annot" data-comment-id="' + c.id + '" data-idx="' + n + '">' + islEsc(text.slice(start, end)) + '</mark>';
    cursor = end;
  });
  html += islEsc(text.slice(cursor));
  return html || '<span class="isl-annot-empty"></span>';
}

// A numbered list of comments matching the <sup> markers left by
// islRenderAnnotated, plus a separate list for any orphaned comments.
// Pass opts.deletable to include a delete button per comment (admin view).
function islRenderCommentList(resolvedComments, opts) {
  opts = opts || {};
  const numbered = resolvedComments.filter(c => !c.orphaned && c.index).sort((a, b) => a.index - b.index);
  const orphaned = resolvedComments.filter(c => c.orphaned);

  function item(c) {
    return '<li data-comment-id="' + c.id + '">' +
      '<span class="isl-comment-quote">&ldquo;' + islEsc(c.quoted_text) + '&rdquo;</span>' +
      '<p class="isl-comment-text">' + islEsc(c.comment_text) + '</p>' +
      (opts.deletable ? '<button type="button" class="isl-comment-del" data-comment-id="' + c.id + '">Delete</button>' : '') +
      '</li>';
  }

  let html = '';
  if (numbered.length) {
    html += '<ol class="isl-comment-list">' + numbered.map(c => '<li data-comment-id="' + c.id + '"><span class="isl-comment-num">' + c.index + '</span>' +
      '<div><span class="isl-comment-quote">&ldquo;' + islEsc(c.quoted_text) + '&rdquo;</span>' +
      '<p class="isl-comment-text">' + islEsc(c.comment_text) + '</p></div>' +
      (opts.deletable ? '<button type="button" class="isl-comment-del" data-comment-id="' + c.id + '">Delete</button>' : '') +
      '</li>').join('') + '</ol>';
  }
  if (orphaned.length) {
    html += '<div class="isl-comment-orphaned"><em>' + orphaned.length + (orphaned.length > 1 ? ' older comments could' : ' older comment could') +
      ' no longer be matched to the current text:</em><ul>' + orphaned.map(item).join('') + '</ul></div>';
  }
  return html;
}