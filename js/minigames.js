/* ============================================================
 * 《阙下归人》· 小游戏/交互节点
 * 火柴点火 · 观察教学 · 黑影惊吓 · 聆听声波 · 剧情回顾
 * ============================================================ */

'use strict';

const Minigames = {
  async run(node) {
    switch (node.type) {
      case 'minigame':
        if (node.id === 'strike-match') return this.strikeMatch(node);
        break;
      case 'observe': return this.observe(node);
      case 'scare':   return this.scare(node);
      case 'listen':  return this.listen(node);
      case 'review':  return this.review(node);
      case 'blood':   return this.blood(node);
      case 'document': return this.document(node);
      case 'redflash': return this.redflash(node);
      case 'writing': return this.writing(node);
      case 'inkdrop': return this.inkdrop(node);
      case 'coffinview': return this.coffinview(node);
      case 'jade': return this.jade(node);
      case 'eye': return this.eye(node);
      case 'evidence-overview': return this.evidenceOverview(node);
      case 'inscription': return this.inscription(node);
      case 'credits': return this.credits(node);
      case 'spot': return this.spot(node);
    }
  },

  /* ---------------- 火柴点火 ---------------- */
  strikeMatch(node) {
    return TombScene.strikeMatch(node);
  },

  /* ---------------- 观察教学 ---------------- */
  observe(node) {
    if (node.id === 'tomb-observe') return TombScene.observe(node);
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      Engine.setLight(node.light || 'match');
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');

      let obsBusy = false; // 串行化观察播报，避免文本互相覆盖
      let remaining = node.points.length;
      node.points.forEach((pt) => {
        const d = document.createElement('button');
        d.className = 'ob-dot';
        d.style.left = pt.x + '%';
        d.style.top = pt.y + '%';
        d.innerHTML = `<span class="ob-pulse"></span><span class="ob-label">${pt.label}</span>`;
        d.addEventListener('pointerdown', (e) => e.stopPropagation()); // 避免误触发对话推进
        d.addEventListener('click', () => {
          if (d.classList.contains('done') || obsBusy) return;
          d.classList.add('done');
          obsBusy = true;
          AudioFX.click();
          remaining--;
          Engine.renderLine({ cls: 'narration', name: '观察', text: pt.text }, { log: null, chars: [] }, 3000).then(() => {
            obsBusy = false;
            if (remaining <= 0) {
              Engine.toast('观察完成——你正想松一口气……', 'good');
              TombScene.wait(700).then(() => {
                layer.classList.remove('show');
                layer.innerHTML = '';
                resolve();
              });
            }
          });
        });
        layer.appendChild(d);
      });
    });
  },

  /* ---------------- 黑影惊吓 ---------------- */
  scare(node) {
    return EncounterScene.scare(node);
  },

  /* ---------------- 聆听声波 ---------------- */
  listen(node) {
    if (EncounterScene.isFirstListen(node)) return EncounterScene.listen(node);
    const count = node.count || SETTINGS.waveCount;
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      Engine.setLight(Engine.items.has('火把') ? 'torch' : 'match');

      const layer = document.getElementById('minigame-layer');
      const build = (again) => {
        layer.innerHTML = '';
        layer.classList.add('show');
        const btn = document.createElement('button');
        btn.className = 'listen-btn';
        btn.textContent = again ? '再听一次' : '仔细聆听';
        layer.appendChild(btn);

        btn.addEventListener('click', () => {
          AudioFX.click();
          btn.remove();
          spawn();
        });
      };

      const spawn = () => {
        AudioFX.droneStart();
        Engine.toast('墓室深处传来阵阵声响……', 'info');
        const slots = [[18, 28], [50, 14], [82, 30], [26, 68], [68, 66]];
        const order = shuffle(slots.slice(0, count));
        const strongest = Math.floor(Math.random() * count);
        const wrap = document.createElement('div');
        wrap.className = 'waves';
        layer.appendChild(wrap);

        order.forEach((pos, idx) => {
          const w = document.createElement('button');
          w.className = 'wave';
          const rings = idx === strongest ? 4 : 2 + (idx % 2);
          let html = '<span class="wave-core"></span>';
          for (let r = 0; r < rings; r++) html += '<i></i>';
          w.innerHTML = html;
          w.style.left = pos[0] + '%';
          w.style.top = pos[1] + '%';
          if (idx === strongest) w.classList.add('hot');
          w.addEventListener('click', () => {
            if (wrap.classList.contains('solved')) return;
            if (idx === strongest) {
              wrap.classList.add('solved');
              w.classList.add('hit');
              AudioFX.success();
              Engine.toast('就是这里！声响最强烈……', 'good');
              Engine.hint('声波选定——场景切换');
              TombScene.wait(1300).then(() => {
                layer.classList.remove('show');
                layer.innerHTML = '';
                resolve();
              });
            } else {
              w.classList.add('miss');
              setTimeout(() => w.classList.remove('miss'), 500);
              if (Engine.mode === 'tour') {
                Engine.toast('似乎我们还不了解前面的，请点击声波最强烈之处', 'warn');
                AudioFX.wrong();
              } else {
                Engine.toast('听错了方向……心神 -1', 'bad');
                Engine.damage('心神损耗……');
                if (Engine.hp <= 0) {
                  wrap.classList.add('solved');
                  Engine.die('心神耗尽——你被黑暗吞没了……', () => {
                    Engine.restoreHp();
                    build(true);
                  });
                }
              }
            }
          });
          wrap.appendChild(w);
        });
      };

      build(false);
    });
  },

  /* ---------------- 血泪喷溅转场（第二幕·凤鸟泣血） ---------------- */
  blood(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      const fx = Engine.els.fx;
      const wrap = document.createElement('div');
      wrap.className = 'blood';
      wrap.innerHTML =
        '<div class="blood-flash"></div>' +
        '<span class="ph-tag">素材占位</span><span class="blood-note">特效·血泪喷溅动图（程序模拟血滴，可替换动图）</span>';
      for (let i = 0; i < 7; i++) {
        const d = document.createElement('i');
        d.className = 'drip';
        d.style.left = (6 + Math.random() * 88) + '%';
        d.style.animationDelay = (Math.random() * 0.9) + 's';
        d.style.animationDuration = (1.1 + Math.random() * 0.9) + 's';
        wrap.appendChild(d);
      }
      fx.appendChild(wrap);
      Engine.els.vignette.classList.add('red');
      AudioFX.scare();
      Engine.shakeStage();
      TombScene.wait(1900).then(() => { wrap.classList.add('out'); Engine.els.vignette.classList.remove('red'); });
      TombScene.wait(2600).then(() => { wrap.remove(); resolve(); });
    });
  },

  /* ---------------- 文档交互（第二幕·名帖） ---------------- */
  document(node) {
    return new Promise((resolve) => {
      if (node.bg) Engine.setBg(node.bg);
      if (node.chars) Engine.setChars(node.chars);
      Engine.setLight(node.light || null);
      Engine.hint(node.hint || '');
      Engine.hideDlg();

      // 写入剧情回顾（探案模式可在回顾中找出）
      const logId = node.log;
      if (logId) {
        Engine.logs[logId] = Engine.logs[logId] || [];
        (node.lines || []).forEach((t) => {
          Engine.logs[logId].push({ doc: true, name: node.docName || '名帖', text: t, evidence: node.evidence || null });
        });
      }

      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const card = document.createElement('button');
      card.className = 'doc-card';
      card.innerHTML = '<span class="ob-pulse"></span><span class="doc-card-icon">📜</span><span class="doc-card-label">名帖</span>';
      card.addEventListener('pointerdown', (e) => e.stopPropagation());
      card.addEventListener('click', () => {
        if (card.classList.contains('done')) return;
        card.classList.add('done');
        AudioFX.click();
        Engine.openDocument(node.docTitle || '', node.lines || []).then(() => {
          // 游览模式：读完名帖自动收录
          if (Engine.mode === 'tour') {
            (node.evidence || []).forEach((id) => Engine.collectEvidence(id));
          }
          layer.classList.remove('show');
          layer.innerHTML = '';
          resolve();
        });
      });
      layer.appendChild(card);
    });
  },

  /* ---------------- 白色交互光点（第五幕·听听百姓在说什么） ---------------- */
  spot(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint || '');
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const spot = document.createElement('button');
      spot.className = 'white-spot';
      spot.innerHTML = '<span class="ob-pulse"></span><span class="spot-core"></span><span class="spot-label">上前听听</span>';
      spot.addEventListener('pointerdown', (e) => e.stopPropagation());
      spot.addEventListener('click', () => {
        if (spot.classList.contains('done')) return;
        spot.classList.add('done');
        AudioFX.click();
        layer.classList.remove('show');
        layer.innerHTML = '';
        resolve();
      });
      layer.appendChild(spot);
    });
  },

  /* ---------------- 红色滤镜闪烁（第四幕·宣读欧刀之刑） ---------------- */
  redflash(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      const fx = Engine.els.fx;
      const wrap = document.createElement('div');
      wrap.className = 'redflash';
      wrap.innerHTML = '<div class="redflash-layer"></div>' +
        '<span class="ph-tag">素材占位</span><span class="redflash-note">特效·众人惊恐表情＋红色滤镜（程序模拟闪烁）</span>';
      fx.appendChild(wrap);
      AudioFX.hurt();
      let n = 0;
      const tick = setInterval(() => {
        if (Engine.isReadingModal() || document.hidden) return;
        wrap.classList.toggle('on');
        n++;
        if (n >= 7) { clearInterval(tick); wrap.remove(); resolve(); }
      }, 260);
    });
  },

  /* ---------------- 上书自讼 · 书写（第四幕） ---------------- */
  writing(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint || '按住笔锋，在纸上写下申诉');
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const wrap = document.createElement('div');
      wrap.className = 'writing-wrap';
      wrap.innerHTML =
        '<div class="writing-title">上书自讼 · 落笔</div>' +
        '<div class="writing-paper"><canvas class="writing-area" width="760" height="330"></canvas></div>' +
        '<div class="writing-meter"><div class="writing-fill"></div></div>' +
        '<span class="ph-tag">素材占位</span><span class="writing-note">书写动画（程序模拟墨迹，可替换书法素材）</span>';
      layer.appendChild(wrap);
      const cv = wrap.querySelector('.writing-area');
      const g = cv.getContext('2d');
      let ink = 0, drawing = false, done = false;
      const target = 260;
      const fill = wrap.querySelector('.writing-fill');
      const addInk = (x, y) => {
        if (done || !drawing) return;
        try {
          g.fillStyle = 'rgba(30,26,20,0.85)';
          g.beginPath();
          g.arc(x, y, 3.5 + Math.random() * 3, 0, Math.PI * 2);
          g.fill();
        } catch (e) {}
        ink++;
        fill.style.width = Math.min(100, (ink / target) * 100) + '%';
        if (ink >= target) finish();
      };
      const finish = () => {
        if (done) return;
        done = true;
        AudioFX.collect();
        Engine.toast('收笔——愿此书能还众人清白。', 'good');
        setTimeout(() => { layer.classList.remove('show'); layer.innerHTML = ''; resolve(); }, 900);
      };
      cv.addEventListener('pointerdown', (e) => { e.stopPropagation(); drawing = true; addInk(e.offsetX || 80, e.offsetY || 90); });
      cv.addEventListener('pointermove', (e) => { if (drawing) addInk(e.offsetX || 80, e.offsetY || 90); });
      cv.addEventListener('pointerup', () => { drawing = false; });
      cv.addEventListener('pointercancel', () => { drawing = false; });
    });
  },

  /* ---------------- 墨滴晕染转场（第四幕末） ---------------- */
  inkdrop(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      const fx = Engine.els.fx;
      const wrap = document.createElement('div');
      wrap.className = 'inkdrop';
      wrap.innerHTML = '<div class="ink-blob"></div>' +
        '<span class="ph-tag">素材占位</span><span class="ink-note">特效·墨滴晕染（程序模拟，可替换动图）</span>';
      fx.appendChild(wrap);
      AudioFX.whoosh();
      TombScene.wait(1300).then(() => { wrap.classList.add('out'); });
      TombScene.wait(2100).then(() => { wrap.remove(); resolve(); });
    });
  },

  /* ---------------- 棺椁遗容（第五幕） ---------------- */
  coffinview(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint || '点击棺椁，再看一眼');
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const spot = document.createElement('button');
      spot.className = 'coffin-spot';
      spot.innerHTML = '<span class="ob-pulse"></span><span class="coffin-label">棺椁</span>';
      spot.addEventListener('pointerdown', (e) => e.stopPropagation());
      spot.addEventListener('click', () => {
        if (spot.classList.contains('done')) return;
        spot.classList.add('done');
        AudioFX.click();
        layer.innerHTML = '';
        const panel = document.createElement('div');
        panel.className = 'coffin-panel';
        const assetBox = document.createElement('div');
        assetBox.className = 'coffin-asset';
        assetBox.appendChild(buildAsset('char-fenghuan-dead', 'char'));
        panel.appendChild(assetBox);
        const textEl = document.createElement('p');
        textEl.className = 'coffin-text';
        textEl.textContent = '冯焕死后容颜，与前三幕所见大不相同：非常瘦、看起来像遭受了虐待。';
        panel.appendChild(textEl);
        const close = document.createElement('button');
        close.className = 'coffin-close';
        close.textContent = '合上棺椁';
        close.addEventListener('pointerdown', (e) => e.stopPropagation());
        close.addEventListener('click', () => {
          AudioFX.click();
          layer.classList.remove('show');
          layer.innerHTML = '';
          resolve();
        });
        panel.appendChild(close);
        layer.appendChild(panel);
      });
      layer.appendChild(spot);
    });
  },

  /* ---------------- 玉蝉含口（第五幕） ---------------- */
  jade(node) {
    return new Promise((resolve) => {
      const detective = Engine.mode === 'detective';
      Engine.hint(node.hint || (detective ? '为冯焕送行，完成最后的礼数' : '放入冯焕口中'));
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const game = document.createElement('div');
      game.className = 'jade-game';
      game.innerHTML =
        '<div class="jade-target"><span class="jade-target-label">冯焕口中</span></div>' +
        '<div class="jade-corpse">' +
          '<span class="ph-tag">素材占位</span><span class="jade-note">冯焕遗容（char-fenghuan-dead）</span>' +
        '</div>' +
        '<div class="jade-hint">把玉蝉放入冯焕口中</div>' +
        '<div class="jade-item"><span class="jade-icon">🦗</span><span>玉蝉</span></div>';
      layer.appendChild(game);
      const item = game.querySelector('.jade-item');
      const target = game.querySelector('.jade-target');
      let dx = 0, dy = 0, dragging = false, done = false;
      const reset = () => { dx = 0; dy = 0; item.style.transform = ''; };
      const fail = () => {
        if (detective) {
          Engine.toast('放错了地方……心神 -1', 'bad');
          Engine.damage('玉蝉放错了地方……');
          if (Engine.hp <= 0) {
            Engine.die('心神耗尽——你被黑暗吞没了……', () => { Engine.restoreHp(); });
          }
        } else {
          Engine.toast('似乎应该放入冯焕口中', 'warn');
        }
        reset();
      };
      item.addEventListener('pointerdown', (e) => {
        if (!done) { dragging = true; if (item.setPointerCapture) item.setPointerCapture(e.pointerId); }
      });
      item.addEventListener('pointermove', (e) => {
        if (!dragging || done) return;
        dx += e.movementX || 0;
        dy += e.movementY || 0;
        item.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      });
      item.addEventListener('pointerup', () => {
        if (!dragging || done) return;
        dragging = false;
        if (dx >= 200 && dy <= -120) {
          done = true;
          target.classList.add('ok');
          AudioFX.collect();
          Engine.toast('玉蝉已放入冯焕口中。', 'good');
          setTimeout(() => { layer.classList.remove('show'); layer.innerHTML = ''; resolve(); }, 1100);
        } else {
          fail();
        }
      });
      item.addEventListener('pointercancel', () => { dragging = false; });
    });
  },

  /* ---------------- 擦泪（第五幕·流泪的眼睛） ---------------- */
  eye(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint || '为它擦干泪水（三次）');
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const eyeEl = document.createElement('button');
      eyeEl.className = 'eye';
      eyeEl.innerHTML = '<span class="eye-ball"></span><i class="tear t1"></i><i class="tear t2"></i><i class="tear t3"></i>' +
        '<span class="ph-tag">素材占位</span><span class="eye-note">特效·流泪的眼睛（程序模拟，可替换素材）</span>';
      layer.appendChild(eyeEl);
      let wipes = 0;
      eyeEl.addEventListener('pointerdown', (e) => e.stopPropagation());
      eyeEl.addEventListener('click', () => {
        if (eyeEl.classList.contains('done')) return;
        wipes++;
        AudioFX.click();
        const t = eyeEl.querySelector('.tear.t' + wipes);
        if (t) t.classList.add('gone');
        if (wipes >= 3) {
          eyeEl.classList.add('done');
          AudioFX.success();
          TombScene.wait(1200).then(() => { layer.classList.remove('show'); layer.innerHTML = ''; resolve(); });
        }
      });
    });
  },

  /* ---------------- 证据一览（第五幕末） ---------------- */
  evidenceOverview(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint || '');
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const panel = document.createElement('div');
      panel.className = 'overview-panel';
      const head = document.createElement('h3');
      head.textContent = '证据一览';
      panel.appendChild(head);
      (node.lines || []).forEach((t) => {
        const p = document.createElement('p');
        p.className = 'overview-line';
        p.textContent = t;
        panel.appendChild(p);
      });
      const doneBtn = document.createElement('button');
      doneBtn.className = 'overview-done';
      doneBtn.textContent = '继续 →';
      doneBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      doneBtn.addEventListener('click', () => {
        AudioFX.click();
        layer.classList.remove('show');
        layer.innerHTML = '';
        resolve();
      });
      panel.appendChild(doneBtn);
      layer.appendChild(panel);
      AudioFX.gong();
    });
  },

  /* ---------------- 铭文拼合（终幕） ---------------- */
  inscription(node) {
    return new Promise((resolve) => {
      const detective = Engine.mode === 'detective';
      Engine.hint(node.hint || '拼凑冯焕生前信息，助他引渡');
      Engine.hideDlg();
      Engine.setBg('bg-shuangque');
      Engine.setChars([]);
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const wrap = document.createElement('div');
      wrap.className = 'ins-game';
      wrap.innerHTML =
        '<div class="ins-title">拼凑冯焕生前信息，助他引渡</div>' +
        '<div class="ins-slots"></div>' +
        '<div class="ins-chunks"></div>' +
        '<span class="ph-tag">素材占位</span><span class="ins-note">双阙、石门与二十字铭文字块（程序实现拼合，建议提供阙身贴图）</span>';
      layer.appendChild(wrap);
      const pieces = detective ? (node.pairs || []) : (node.groups || []);
      const slots = wrap.querySelector('.ins-slots');
      const chunkRow = wrap.querySelector('.ins-chunks');
      let placed = 0;
      const resetPuzzle = () => {
        placed = 0;
        for (const s of slots.children) { s.textContent = ''; s.classList.remove('filled'); }
        for (const c of chunkRow.children) { c.classList.remove('used'); }
      };
      pieces.forEach(() => {
        const s = document.createElement('div');
        s.className = 'ins-slot';
        slots.appendChild(s);
      });
      const order = shuffle(pieces.map((_, i) => i));
      order.forEach((i) => {
        const b = document.createElement('button');
        b.className = 'ins-chunk';
        b.textContent = pieces[i];
        b.dataset.order = String(i);
        b.addEventListener('pointerdown', (e) => e.stopPropagation());
        b.addEventListener('click', () => {
          if (b.classList.contains('used')) return;
          if (i === placed) {
            b.classList.add('used');
            slots.children[placed].textContent = pieces[i];
            slots.children[placed].classList.add('filled');
            placed++;
            AudioFX.click();
            if (placed === pieces.length) {
              AudioFX.success();
              Engine.toast('铭文拼合——石门开启。', 'good');
              wrap.classList.add('solved');
              TombScene.wait(1600).then(() => { layer.classList.remove('show'); layer.innerHTML = ''; resolve(); });
            }
          } else {
            b.classList.add('miss');
            setTimeout(() => b.classList.remove('miss'), 450);
            if (detective) {
              Engine.toast('拼错了……心神 -1', 'bad');
              Engine.damage('铭文拼错了……');
              if (Engine.hp <= 0) {
                Engine.die('心神耗尽——你被黑暗吞没了……', () => { Engine.restoreHp(); resetPuzzle(); });
              }
            } else {
              Engine.toast('按冯焕的生平顺序来拼', 'warn');
            }
          }
        });
        chunkRow.appendChild(b);
      });
    });
  },

  /* ---------------- 故事结束语（尾声·打字呈现） ---------------- */
  credits(node) {
    return new Promise((resolve) => {
      Engine.hint('');
      Engine.hideDlg();
      Engine.setBg(null);
      Engine.setChars([]);
      Engine.setLight(null);
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const wrap = document.createElement('div');
      wrap.className = 'credits';
      const textEl = document.createElement('div');
      textEl.className = 'credits-text';
      wrap.appendChild(textEl);
      const skipBtn = document.createElement('button');
      skipBtn.className = 'credits-skip';
      skipBtn.textContent = '跳过 ▸▸';
      wrap.appendChild(skipBtn);
      const doneBtn = document.createElement('button');
      doneBtn.className = 'credits-done hidden';
      doneBtn.textContent = '进入尾声';
      wrap.appendChild(doneBtn);
      layer.appendChild(wrap);
      const lines = node.lines || [];
      let li = 0, settling = false, typerAuto = null;
      const showLine = () => {
        if (li >= lines.length) {
          doneBtn.classList.remove('hidden');
          AudioFX.gong();
          return;
        }
        typewriter(textEl, lines[li], 34, () => {});
        clearTimeout(typerAuto);
        typerAuto = setTimeout(() => { if (!settling) { li++; showLine(); } }, 1900 + lines[li].length * 28);
      };
      const skipAll = () => {
        if (settling) return;
        settling = true;
        clearTimeout(typerAuto);
        li = lines.length - 1;
        textEl.textContent = lines[li];
        setTimeout(() => {
          doneBtn.classList.remove('hidden');
          AudioFX.gong();
        }, 400);
      };
      skipBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      skipBtn.addEventListener('click', () => { AudioFX.click(); skipAll(); });
      doneBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      doneBtn.addEventListener('click', () => {
        AudioFX.click();
        layer.classList.remove('show');
        layer.innerHTML = '';
        resolve();
      });
      wrap.addEventListener('pointerdown', () => {
        if (!settling) { clearTimeout(typerAuto); li++; showLine(); }
      });
      showLine();
    });
  },

  /* ---------------- 剧情回顾（探案模式核心） ---------------- */
  review(node) {
    if (Engine.mode !== 'detective') return Promise.resolve(); // 游览模式：关键句已自动发光收录
    const log = Engine.logs[node.logId] || [];
    const keyIds = [];
    log.forEach((l) => { if (l.evidence) l.evidence.forEach((id) => { if (!keyIds.includes(id)) keyIds.push(id); }); });

    return new Promise((resolve) => {
      const open = () => {
        const list = Engine.els.reviewList;
        list.innerHTML = '';
        Engine.els.reviewHint.textContent =
          '关键句不会发光——请从这段对白中，找出能证明墓主身份的关键证据。找错会损耗心神（-1），心神耗尽将重来。';
        Engine.els.reviewDone.classList.remove('show');

        const rows = [];
        const updateProgress = () => {
          const got = keyIds.filter((id) => Engine.hasEvidence(id)).length;
          Engine.els.reviewProgress.textContent = `已找到关键证据 ${got} / ${keyIds.length}`;
        };

        log.forEach((l) => {
          if (!l.speaker && !l.doc) return; // 仅对白句与文档可点击
          const row = document.createElement('button');
          row.className = 'rev-line';
          let who, color;
          if (l.doc) { who = '【' + (l.name || '名帖') + '】'; color = '#c9a86a'; }
          else {
            who = l.speaker === 'tourist' ? (Engine.player.name || '游客') : (CHAR_DEFS[l.speaker] ? CHAR_DEFS[l.speaker].name : l.speaker);
            color = CHAR_DEFS[l.speaker] ? CHAR_DEFS[l.speaker].color : '#ccc';
          }
          row.innerHTML = `<span class="rev-who" style="color:${color}">${who}</span><span class="rev-text">${l.text}</span><span class="rev-mark"></span>`;
          const markGot = (r) => { r.classList.add('got'); r.querySelector('.rev-mark').textContent = '✓ 已收录'; };
          row.addEventListener('click', () => {
            if (row.classList.contains('got') || row.classList.contains('wrong')) return;
            const ids = l.evidence || [];
            if (ids.length) {
              // 证据已收录过的来源句：直接标记，不扣心神
              if (ids.every((id) => Engine.hasEvidence(id))) { markGot(row); return; }
              ids.forEach((id) => Engine.collectEvidence(id));
              // 同一证据的其他来源句一并标记
              rows.forEach(({ row: r2, l: l2 }) => {
                if (l2.evidence && l2.evidence.length && l2.evidence.every((id) => Engine.hasEvidence(id))) markGot(r2);
              });
              updateProgress();
              if (keyIds.every((id) => Engine.hasEvidence(id))) {
                Engine.toast('关键证据已全部收录！', 'good');
                Engine.els.reviewDone.classList.add('show');
              }
            } else {
              row.classList.add('wrong');
              row.querySelector('.rev-mark').textContent = '无关';
              Engine.toast('无关紧要的句子……心神 -1', 'bad');
              Engine.damage('无关紧要的句子……');
              if (Engine.hp <= 0) {
                Engine.die('心神耗尽——线索湮灭，重新来过……', () => {
                  Engine.restoreHp();
                  open();
                });
              }
            }
          });
          list.appendChild(row);
          rows.push({ row, l });
        });
        updateProgress();

        Engine.els.reviewDone.onclick = () => {
          AudioFX.click();
          Engine.els.review.classList.remove('show');
          resolve();
        };
        if(keyIds.every(id=>Engine.hasEvidence(id)))Engine.els.reviewDone.classList.add('show');
        Engine.els.review.classList.add('show');
      };
      open();
    });
  },
};

/* ---------- 工具 ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

