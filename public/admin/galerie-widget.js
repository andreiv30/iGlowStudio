/* Widget „galerie” pentru Decap CMS: adaugi mai multe poze deodată (selecție multiplă sau drag & drop),
   le ordonezi, le scrii o descriere opțională și le ștergi. Pozele noi se salvează în public/uploads
   în același commit cu galeria, când apeși „Publish”; GitHub Actions le transformă apoi în WebP. */
(function () {
  if (!window.CMS || !window.h || !window.createClass) return;
  var h = window.h;

  var toArray = function (value) {
    if (!value) return [];
    var v = typeof value.toJS === 'function' ? value.toJS() : value;
    return Array.isArray(v) ? v.map(function (it) {
      return typeof it === 'string' ? { imagine: it, descriere: '' } : { imagine: it.imagine || '', descriere: it.descriere || '' };
    }) : [];
  };

  var css = [
    '.glw{display:flex;flex-direction:column;gap:14px;padding:14px;border:2px dashed #dfd5c9;border-radius:10px;background:#fbf9f6;transition:border-color .2s,background .2s}',
    '.glw.is-over{border-color:#8f6f48;background:#f4ece2}',
    '.glw__top{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px}',
    '.glw__add{appearance:none;border:0;border-radius:8px;background:#8f6f48;color:#fff;font:600 14px/1 system-ui,sans-serif;padding:12px 18px;cursor:pointer}',
    '.glw__add:hover{background:#7a5c38}',
    '.glw__add[disabled]{opacity:.6;cursor:wait}',
    '.glw__hint{color:#6b625a;font:13px/1.4 system-ui,sans-serif}',
    '.glw__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}',
    '.glw__item{display:flex;flex-direction:column;gap:6px;padding:6px;border-radius:8px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.08)}',
    '.glw__thumb{position:relative;aspect-ratio:1/1;border-radius:6px;overflow:hidden;background:#eee6dd}',
    '.glw__thumb img{width:100%;height:100%;object-fit:cover;display:block}',
    '.glw__num{position:absolute;left:6px;top:6px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:rgba(26,19,13,.7);color:#fff;font:600 12px/22px system-ui,sans-serif;text-align:center}',
    '.glw__desc{width:100%;box-sizing:border-box;border:1px solid #dfd5c9;border-radius:6px;padding:6px 8px;font:13px/1.3 system-ui,sans-serif}',
    '.glw__btns{display:flex;gap:4px}',
    '.glw__btns button{flex:1;appearance:none;border:1px solid #dfd5c9;border-radius:6px;background:#fff;padding:5px 0;cursor:pointer;font:600 13px/1 system-ui,sans-serif;color:#3c2d23}',
    '.glw__btns button:hover{background:#f4ece2}',
    '.glw__btns .glw__del{color:#a3352b}',
    '.glw__empty{color:#6b625a;font:14px/1.4 system-ui,sans-serif;padding:18px 0;text-align:center}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var Control = window.createClass({
    getInitialState: function () { return { busy: false, over: false, previews: {} }; },
    items: function () { return toArray(this.props.value); },
    emit: function (list) { this.props.onChange(list); },
    pick: function () { if (this.input) this.input.click(); },
    addFiles: function (fileList) {
      var self = this;
      var files = Array.prototype.filter.call(fileList || [], function (f) { return /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name); });
      if (!files.length) return;
      self.setState({ busy: true });
      var added = [];
      var previews = Object.assign({}, self.state.previews);
      var run = files.reduce(function (p, file) {
        return p.then(function () {
          return Promise.resolve(self.props.onPersistMedia(file, { field: self.props.field })).then(function (action) {
            var pl = action && action.payload;
            var repoPath = pl && (pl.path || (pl.mediaFile && pl.mediaFile.path));
            if (!repoPath) return;
            var url = '/' + String(repoPath).replace(/^\/?public\//, '');
            previews[url] = URL.createObjectURL(file);
            added.push({ imagine: url, descriere: '' });
          });
        });
      }, Promise.resolve());
      run.catch(function (e) { console.error(e); }).then(function () {
        self.setState({ busy: false, previews: previews });
        if (added.length) self.emit(self.items().concat(added));
      });
    },
    move: function (i, d) {
      var list = this.items(); var j = i + d;
      if (j < 0 || j >= list.length) return;
      var t = list[i]; list[i] = list[j]; list[j] = t;
      this.emit(list);
    },
    remove: function (i) { var list = this.items(); list.splice(i, 1); this.emit(list); },
    describe: function (i, text) { var list = this.items(); list[i].descriere = text; this.emit(list); },
    render: function () {
      var self = this;
      var list = self.items();
      var drop = {
        onDragOver: function (e) { e.preventDefault(); if (!self.state.over) self.setState({ over: true }); },
        onDragLeave: function () { self.setState({ over: false }); },
        onDrop: function (e) { e.preventDefault(); self.setState({ over: false }); self.addFiles(e.dataTransfer && e.dataTransfer.files); }
      };
      return h('div', Object.assign({ className: 'glw' + (self.state.over ? ' is-over' : ''), id: self.props.forID }, drop),
        h('div', { className: 'glw__top' },
          h('button', { type: 'button', className: 'glw__add', onClick: self.pick, disabled: self.state.busy },
            self.state.busy ? 'Se încarcă…' : '+ Adaugă poze'),
          h('span', { className: 'glw__hint' }, 'Poți selecta mai multe poze deodată sau le poți trage aici. ' + list.length + ' ' + (list.length === 1 ? 'poză' : 'poze') + ' în galerie.'),
          h('input', { type: 'file', accept: 'image/*,.heic,.heif', multiple: true, style: { display: 'none' }, ref: function (el) { self.input = el; },
            onChange: function (e) { self.addFiles(e.target.files); e.target.value = ''; } })
        ),
        list.length === 0
          ? h('p', { className: 'glw__empty' }, 'Galeria e goală. Apasă „Adaugă poze”.')
          : h('div', { className: 'glw__grid' }, list.map(function (it, i) {
              return h('div', { className: 'glw__item', key: it.imagine + i },
                h('div', { className: 'glw__thumb' },
                  h('img', { src: self.state.previews[it.imagine] || it.imagine, alt: '', loading: 'lazy' }),
                  h('span', { className: 'glw__num' }, i + 1)),
                h('input', { className: 'glw__desc', type: 'text', placeholder: 'Descriere (opțional)', value: it.descriere,
                  onChange: function (e) { self.describe(i, e.target.value); } }),
                h('div', { className: 'glw__btns' },
                  h('button', { type: 'button', title: 'Mută mai în față', onClick: function () { self.move(i, -1); } }, '←'),
                  h('button', { type: 'button', title: 'Mută mai în spate', onClick: function () { self.move(i, 1); } }, '→'),
                  h('button', { type: 'button', className: 'glw__del', title: 'Scoate din galerie', onClick: function () { self.remove(i); } }, '✕'))
              );
            }))
      );
    }
  });

  var Preview = window.createClass({
    render: function () {
      var list = toArray(this.props.value);
      return h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' } },
        list.map(function (it, i) { return h('img', { key: i, src: it.imagine, style: { width: '100%', aspectRatio: '1', objectFit: 'cover' } }); }));
    }
  });

  window.CMS.registerWidget('galerie', Control, Preview);
})();
