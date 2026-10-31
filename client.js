window.__ModuleLoader__.load({
  id: 'dsh-wallpaper-cnr',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useRef, useState, useSyncExternalStore } = React

    const NS = 'dsh-wallpaper'
    const PREFS_KEY = 'dsh-wallpaper:v1:prefs'
    const IMAGE_KEY = 'dsh-wallpaper:v1:image'
    const MAX_FILE_BYTES = 30 * 1024 * 1024
    const MAX_DATA_CHARS = 3000000
    const FITS = ['cover', 'contain', 'tile']
    const MASKS = ['soft', 'none']
    const HEX_COLOR = /^#[0-9a-f]{6}$/i

    const EN = {
      navLabel: 'Wallpaper',
      title: 'Wallpaper',
      intro: 'Use your own image behind the DeepSeek Harness workspace, including the startup screen.',
      previewEmpty: 'No image selected',
      previewHint: 'Drop an image here, or use Upload image.',
      previewAlt: 'Wallpaper preview',
      upload: 'Upload image',
      replace: 'Replace image',
      remove: 'Remove',
      enabled: 'Enable wallpaper',
      enabledDesc: 'The image stays saved when you turn this off.',
      fit: 'Image fit',
      fitDesc: 'How the image fills the window.',
      fitCover: 'Fill',
      fitContain: 'Fit',
      fitTile: 'Tile',
      mask: 'Shade effect',
      maskDesc: '“No mask” keeps the artwork clear and puts the interface directly over it.',
      maskSoft: 'Soft',
      maskNone: 'No mask',
      fontColor: 'Text color',
      fontColorDesc: 'Pick a color with enough contrast for your image. Best paired with No mask.',
      fontAuto: 'Theme',
      fontWhite: 'White',
      fontBlack: 'Dark',
      fontCustom: 'Custom',
      intensity: 'Background visibility',
      intensityDesc: 'Higher values let more of the image show through the interface.',
      blur: 'Blur',
      blurDesc: 'Soften the image behind the interface.',
      dim: 'Shade strength',
      dimDesc: 'Wash the image toward the theme background to keep text comfortable.',
      hint: 'JPG, PNG, WebP and other browser-supported images are resized and compressed automatically.',
      privacy: 'The image is stored in this browser only and is never uploaded to a server.',
      processing: 'Processing image…',
      active: 'Active',
      inactive: 'Off',
      storageWarning: 'The browser could not save the image. It will apply until you reload the page.',
      errorTooLarge: 'That image is too large. Choose one under 30 MB.',
      errorUnsupported: 'Choose an image file.',
      errorDecode: 'This image could not be read. Try another file.',
      errorStorage: 'The image is applied, but the browser refused to store it.',
    }

    const ZH = {
      navLabel: '背景图片',
      title: '背景图片',
      intro: '上传一张图片，作为 DeepSeek Harness 工作区和启动界面的背景。',
      previewEmpty: '还没有选择图片',
      previewHint: '将图片拖到这里，或点击上传。',
      previewAlt: '背景图片预览',
      upload: '上传图片',
      replace: '更换图片',
      remove: '移除',
      enabled: '启用背景',
      enabledDesc: '关闭后恢复原生背景，图片仍会保留。',
      fit: '填充方式',
      fitDesc: '图片在窗口中的显示方式。',
      fitCover: '填满',
      fitContain: '适应',
      fitTile: '平铺',
      mask: '遮罩效果',
      maskDesc: '“无遮罩”会保持图片清晰，让界面以透明效果直接叠在图片上。',
      maskSoft: '柔和',
      maskNone: '无遮罩',
      fontColor: '字体颜色',
      fontColorDesc: '选择与背景图片对比清晰的颜色，建议搭配“无遮罩”使用。',
      fontAuto: '跟随主题',
      fontWhite: '白色',
      fontBlack: '深色',
      fontCustom: '自定义',
      intensity: '背景可见度',
      intensityDesc: '数值越高，界面越通透，图片越明显。',
      blur: '模糊',
      blurDesc: '柔化界面背后的图片。',
      dim: '遮罩强度',
      dimDesc: '用界面底色遮盖图片，让文字更易阅读。',
      hint: '支持 JPG、PNG、WebP 等浏览器可读取的图片，会自动缩放和压缩。',
      privacy: '图片仅保存在当前浏览器，不会上传到服务器。',
      processing: '正在处理图片…',
      active: '已启用',
      inactive: '已关闭',
      storageWarning: '浏览器无法保存这张图片；刷新页面后需要重新上传。',
      errorTooLarge: '图片太大了，请选择 30 MB 以内的图片。',
      errorUnsupported: '请选择图片文件。',
      errorDecode: '无法读取这张图片，请换一张试试。',
      errorStorage: '图片已应用，但浏览器拒绝保存它。',
    }

    const DEFAULTS = {
      enabled: true,
      fit: 'cover',
      mask: 'soft',
      fontColor: 'auto',
      intensity: 45,
      blur: 0,
      dim: 18,
      image: '',
      imageName: '',
      busy: false,
      error: null,
      storageError: false,
    }

    const OWNED_VARS = [
      '--dsh-wallpaper-image',
      '--dsh-wallpaper-surface',
      '--dsh-wallpaper-dim',
      '--dsh-wallpaper-blur',
      '--dsh-wallpaper-font-color',
    ]

    function clamp(value, min, max) {
      const number = Number(value)
      if (!Number.isFinite(number)) return min
      return Math.min(max, Math.max(min, number))
    }

    function readState() {
      const state = { ...DEFAULTS }
      try {
        const raw = localStorage.getItem(PREFS_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (typeof saved.enabled === 'boolean') state.enabled = saved.enabled
          if (FITS.includes(saved.fit)) state.fit = saved.fit
          if (MASKS.includes(saved.mask)) state.mask = saved.mask
          if (saved.fontColor === 'auto' || (typeof saved.fontColor === 'string' && HEX_COLOR.test(saved.fontColor))) {
            state.fontColor = saved.fontColor
          }
          state.intensity = clamp(saved.intensity, 0, 100)
          state.blur = clamp(saved.blur, 0, 30)
          state.dim = clamp(saved.dim, 0, 60)
          if (typeof saved.imageName === 'string') state.imageName = saved.imageName
        }
        const image = localStorage.getItem(IMAGE_KEY)
        if (typeof image === 'string' && image.startsWith('data:image/')) state.image = image
      } catch {
        state.storageError = true
      }
      if (!state.image) state.imageName = ''
      return state
    }

    function savePrefs(state) {
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
          enabled: state.enabled,
          fit: state.fit,
          mask: state.mask,
          fontColor: state.fontColor,
          intensity: state.intensity,
          blur: state.blur,
          dim: state.dim,
          imageName: state.imageName,
        }))
        return true
      } catch {
        return false
      }
    }

    function surfaceAlpha(intensity) {
      // 0 => mostly opaque (subtle), 100 => strongly see-through.
      return clamp(0.88 - (clamp(intensity, 0, 100) / 100) * 0.40, 0.48, 0.88)
    }

    function clearApplied() {
      const root = document.documentElement
      if (!root) return
      root.removeAttribute('data-dsh-wallpaper')
      root.removeAttribute('data-dsh-wallpaper-fit')
      root.removeAttribute('data-dsh-wallpaper-mask')
      root.removeAttribute('data-dsh-wallpaper-font')
      for (const name of OWNED_VARS) root.style.removeProperty(name)
    }

    function applyState(state) {
      const root = document.documentElement
      if (!root) return
      if (!state.enabled || !state.image) {
        clearApplied()
        return
      }
      root.setAttribute('data-dsh-wallpaper', 'on')
      root.setAttribute('data-dsh-wallpaper-fit', FITS.includes(state.fit) ? state.fit : 'cover')
      root.setAttribute('data-dsh-wallpaper-mask', MASKS.includes(state.mask) ? state.mask : 'soft')
      const fontColor = state.fontColor !== 'auto' && HEX_COLOR.test(state.fontColor) ? state.fontColor : ''
      if (fontColor) {
        root.setAttribute('data-dsh-wallpaper-font', 'custom')
        root.style.setProperty('--dsh-wallpaper-font-color', fontColor)
      } else {
        root.removeAttribute('data-dsh-wallpaper-font')
        root.style.removeProperty('--dsh-wallpaper-font-color')
      }
      root.style.setProperty('--dsh-wallpaper-image', 'url("' + state.image + '")')
      root.style.setProperty('--dsh-wallpaper-surface', String(surfaceAlpha(state.intensity).toFixed(3)))
      root.style.setProperty('--dsh-wallpaper-dim', String(clamp(state.dim, 0, 60) / 100))
      root.style.setProperty('--dsh-wallpaper-blur', clamp(state.blur, 0, 30) + 'px')
    }

    function createStore() {
      let state = readState()
      let uploadToken = 0
      const listeners = new Set()

      const emit = () => {
        for (const listener of Array.from(listeners)) {
          try {
            listener()
          } catch {
            // A broken subscriber must not stop the others or the style sync.
          }
        }
      }

      const commit = (patch, persist = true) => {
        let next = { ...state, ...patch }
        if (persist) {
          if (savePrefs(next)) next.storageError = false
          else next.storageError = true
        }
        state = next
        emit()
      }

      const setFile = async (file) => {
        if (!file || state.busy) return
        const token = ++uploadToken
        if (!file.type || !file.type.startsWith('image/')) {
          commit({ error: 'unsupported' }, false)
          return
        }
        if (file.size > MAX_FILE_BYTES) {
          commit({ error: 'tooLarge' }, false)
          return
        }
        commit({ busy: true, error: null }, false)
        try {
          const data = await prepareImage(file)
          if (token !== uploadToken) return
          try {
            localStorage.setItem(IMAGE_KEY, data)
          } catch {
            commit({ image: data, imageName: file.name || '', busy: false, error: 'storage' }, false)
            return
          }
          commit({ image: data, imageName: file.name || '', busy: false, error: null })
        } catch {
          if (token !== uploadToken) return
          commit({ busy: false, error: 'decode' }, false)
        }
      }

      const clear = () => {
        uploadToken++
        try {
          localStorage.removeItem(IMAGE_KEY)
        } catch {
          // The in-memory image still clears below.
        }
        commit({ image: '', imageName: '', busy: false, error: null })
      }

      return {
        getSnapshot: () => state,
        subscribe: (listener) => {
          listeners.add(listener)
          return () => listeners.delete(listener)
        },
        setField: (key, value) => {
          if (key === 'intensity') commit({ intensity: clamp(value, 0, 100) })
          else if (key === 'blur') commit({ blur: clamp(value, 0, 30) })
          else if (key === 'dim') commit({ dim: clamp(value, 0, 60) })
          else if (key === 'enabled') commit({ enabled: Boolean(value) })
          else if (key === 'fit' && FITS.includes(value)) commit({ fit: value })
          else if (key === 'mask' && MASKS.includes(value)) commit({ mask: value })
          else if (key === 'fontColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ fontColor: value })
          }
        },
        setFile,
        clear,
      }
    }

    async function decodeSource(file) {
      if (typeof createImageBitmap === 'function') {
        try {
          const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
          return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            close: () => bitmap.close(),
          }
        } catch {
          // Fall through to the HTMLImageElement path.
        }
      }
      const url = URL.createObjectURL(file)
      try {
        const image = new Image()
        image.decoding = 'async'
        image.src = url
        await new Promise((resolve, reject) => {
          image.onload = () => resolve()
          image.onerror = () => reject(new Error('image decode failed'))
        })
        return {
          source: image,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          close: () => URL.revokeObjectURL(url),
        }
      } catch (error) {
        URL.revokeObjectURL(url)
        throw error
      }
    }

    async function prepareImage(file) {
      const decoded = await decodeSource(file)
      try {
        if (!decoded.width || !decoded.height) throw new Error('empty image')
        const attempts = [
          { max: 2200, quality: 0.84 },
          { max: 1700, quality: 0.78 },
          { max: 1280, quality: 0.72 },
          { max: 960, quality: 0.68 },
        ]
        let last = ''
        for (const attempt of attempts) {
          const scale = Math.min(1, attempt.max / Math.max(decoded.width, decoded.height))
          const width = Math.max(1, Math.round(decoded.width * scale))
          const height = Math.max(1, Math.round(decoded.height * scale))
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('canvas unavailable')
          context.imageSmoothingEnabled = true
          context.imageSmoothingQuality = 'high'
          context.drawImage(decoded.source, 0, 0, width, height)
          let data = canvas.toDataURL('image/webp', attempt.quality)
          if (!data.startsWith('data:image/webp')) {
            data = canvas.toDataURL('image/jpeg', attempt.quality)
          }
          last = data
          if (data.length <= MAX_DATA_CHARS) break
        }
        if (!last.startsWith('data:image/')) throw new Error('image encode failed')
        return last
      } finally {
        try {
          decoded.close()
        } catch {
          // Best-effort resource release.
        }
      }
    }

    function errorText(t, code) {
      if (code === 'tooLarge') return t('errorTooLarge')
      if (code === 'unsupported') return t('errorUnsupported')
      if (code === 'storage') return t('errorStorage')
      return t('errorDecode')
    }

    function Row(props) {
      return h('div', { className: 'dshw-row' },
        h('div', { className: 'dshw-row-copy' },
          h('div', { className: 'dshw-row-title' }, props.title),
          props.desc ? h('div', { className: 'dshw-row-desc' }, props.desc) : null,
        ),
        h('div', { className: 'dshw-row-control' }, props.children),
      )
    }

    function Switch(props) {
      return h('label', { className: 'dshw-switch', title: props.label },
        h('input', {
          type: 'checkbox',
          checked: props.checked,
          'aria-label': props.label,
          onChange: (event) => props.onChange(event.target.checked),
        }),
        h('span', { className: 'dshw-switch-track', 'aria-hidden': true },
          h('span', { className: 'dshw-switch-thumb' }),
        ),
      )
    }

    function Slider(props) {
      return h('div', { className: 'dshw-slider' },
        h('input', {
          type: 'range',
          min: props.min,
          max: props.max,
          step: props.step || 1,
          value: props.value,
          disabled: props.disabled,
          'aria-label': props.label,
          onChange: (event) => props.onChange(Number(event.target.value)),
        }),
        h('span', { className: 'dshw-value' }, props.value + props.suffix),
      )
    }

    function Segments(props) {
      return h('div', { className: 'dshw-segments', role: 'group', 'aria-label': props.label },
        props.options.map((option) => h('button', {
          key: option.value,
          type: 'button',
          className: 'dshw-segment' + (props.value === option.value ? ' dshw-segment--on' : ''),
          'aria-pressed': props.value === option.value,
          disabled: props.disabled,
          onClick: () => props.onChange(option.value),
        }, option.label)),
      )
    }

    function PlaceholderIcon() {
      return h('svg', {
        viewBox: '0 0 64 48',
        width: 64,
        height: 48,
        'aria-hidden': true,
        className: 'dshw-placeholder-icon',
      },
      h('rect', { x: 2, y: 2, width: 60, height: 44, rx: 7, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, opacity: 0.55 }),
      h('circle', { cx: 45, cy: 16, r: 5, fill: 'currentColor', opacity: 0.55 }),
      h('path', { d: 'M8 38 21 23l8 9 7-7 15 13Z', fill: 'currentColor', opacity: 0.38 }),
      )
    }

    function SettingsPage(props) {
      const { store, t, locale } = props
      const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
      useSyncExternalStore(
        (listener) => locale.subscribe(listener),
        () => locale.getSnapshot().revision,
        () => 0,
      )
      const inputRef = useRef(null)
      const [dragging, setDragging] = useState(false)

      const previewStyle = state.image ? {
        backgroundImage: 'url("' + state.image + '")',
        backgroundSize: state.fit === 'cover' ? 'cover' : state.fit === 'contain' ? 'contain' : '280px auto',
        backgroundRepeat: state.fit === 'tile' ? 'repeat' : 'no-repeat',
        backgroundPosition: 'center',
      } : undefined

      const drop = (event) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]
        if (file) store.setFile(file)
      }

      return h('section', { className: 'dshw-page' },
        h('header', { className: 'dshw-heading' },
          h('h1', { className: 'dshw-title' }, t('title')),
          h('p', { className: 'dshw-intro' }, t('intro')),
        ),

        h('div', { className: 'dshw-card' },
          h('div', {
            className: 'dshw-preview' + (dragging ? ' dshw-preview--drag' : ''),
            role: state.image ? 'img' : undefined,
            'aria-label': state.image ? t('previewAlt') : undefined,
            style: previewStyle,
            onDragOver: (event) => {
              event.preventDefault()
              if (!dragging) setDragging(true)
            },
            onDragLeave: () => setDragging(false),
            onDrop: drop,
          },
          state.image
            ? h('span', {
              className: 'dshw-badge' + (state.enabled ? ' dshw-badge--on' : ''),
            }, state.enabled ? t('active') : t('inactive'))
            : h('div', { className: 'dshw-empty' },
              h(PlaceholderIcon),
              h('div', { className: 'dshw-empty-title' }, t('previewEmpty')),
              h('div', { className: 'dshw-empty-hint' }, t('previewHint')),
            ),
          state.busy
            ? h('div', { className: 'dshw-processing', role: 'status' },
              h('span', { className: 'dshw-spinner', 'aria-hidden': true }),
              h('span', null, t('processing')),
            )
            : null,
          ),

          h('div', { className: 'dshw-actions' },
            h('input', {
              ref: inputRef,
              className: 'dshw-file',
              type: 'file',
              accept: 'image/*',
              onChange: (event) => {
                const file = event.target.files && event.target.files[0]
                if (file) store.setFile(file)
                event.target.value = ''
              },
            }),
            h('button', {
              type: 'button',
              className: 'dshw-button dshw-button--primary',
              disabled: state.busy,
              onClick: () => inputRef.current && inputRef.current.click(),
            }, state.image ? t('replace') : t('upload')),
            h('button', {
              type: 'button',
              className: 'dshw-button',
              disabled: !state.image || state.busy,
              onClick: store.clear,
            }, t('remove')),
            state.imageName
              ? h('span', { className: 'dshw-filename', title: state.imageName }, state.imageName)
              : null,
          ),
          state.error
            ? h('p', { className: 'dshw-error', role: 'alert' }, errorText(t, state.error))
            : null,
          state.storageError
            ? h('p', { className: 'dshw-warning', role: 'alert' }, t('storageWarning'))
            : null,
        ),

        h('div', { className: 'dshw-card dshw-settings' },
          h(Row, {
            title: t('enabled'),
            desc: t('enabledDesc'),
          }, h(Switch, {
            checked: state.enabled,
            label: t('enabled'),
            onChange: (value) => store.setField('enabled', value),
          })),

          h(Row, {
            title: t('fit'),
            desc: t('fitDesc'),
          }, h(Segments, {
            label: t('fit'),
            value: state.fit,
            disabled: !state.image,
            options: [
              { value: 'cover', label: t('fitCover') },
              { value: 'contain', label: t('fitContain') },
              { value: 'tile', label: t('fitTile') },
            ],
            onChange: (value) => store.setField('fit', value),
          })),

          h(Row, {
            title: t('mask'),
            desc: t('maskDesc'),
          }, h(Segments, {
            label: t('mask'),
            value: state.mask,
            disabled: !state.image,
            options: [
              { value: 'soft', label: t('maskSoft') },
              { value: 'none', label: t('maskNone') },
            ],
            onChange: (value) => store.setField('mask', value),
          })),

          h(Row, {
            title: t('fontColor'),
            desc: t('fontColorDesc'),
          }, h('div', { className: 'dshw-color-control' },
            h(Segments, {
              label: t('fontColor'),
              value: state.fontColor,
              disabled: !state.image,
              options: [
                { value: 'auto', label: t('fontAuto') },
                { value: '#ffffff', label: t('fontWhite') },
                { value: '#0f1115', label: t('fontBlack') },
              ],
              onChange: (value) => store.setField('fontColor', value),
            }),
            h('label', { className: 'dshw-color-input', title: t('fontCustom') },
              h('input', {
                type: 'color',
                value: state.fontColor === 'auto' ? '#ffffff' : state.fontColor,
                'aria-label': t('fontCustom'),
                disabled: !state.image,
                onChange: (event) => store.setField('fontColor', event.target.value),
              }),
              h('span', null, t('fontCustom')),
            ),
          )),

          h(Row, {
            title: t('intensity'),
            desc: t('intensityDesc'),
          }, h(Slider, {
            label: t('intensity'),
            min: 0,
            max: 100,
            value: state.mask === 'none' ? 0 : state.intensity,
            suffix: '%',
            disabled: !state.image || state.mask === 'none',
            onChange: (value) => store.setField('intensity', value),
          })),

          h(Row, {
            title: t('blur'),
            desc: t('blurDesc'),
          }, h(Slider, {
            label: t('blur'),
            min: 0,
            max: 30,
            value: state.blur,
            suffix: 'px',
            disabled: !state.image,
            onChange: (value) => store.setField('blur', value),
          })),

          h(Row, {
            title: t('dim'),
            desc: t('dimDesc'),
          }, h(Slider, {
            label: t('dim'),
            min: 0,
            max: 60,
            value: state.mask === 'none' ? 0 : state.dim,
            suffix: '%',
            disabled: !state.image || state.mask === 'none',
            onChange: (value) => store.setField('dim', value),
          })),
        ),

        h('p', { className: 'dshw-note' }, t('privacy')),
        h('p', { className: 'dshw-note dshw-note--muted' }, t('hint')),
      )
    }

    const GLOBAL_CSS = `
:root[data-dsh-wallpaper="on"] body {
  isolation: isolate;
  background-color: #f4f5f7 !important;
  --dsw-alias-bg-base: rgba(255, 255, 255, var(--dsh-wallpaper-surface, 0.6)) !important;
  --dsw-alias-bg-layer-1: rgba(255, 255, 255, calc(var(--dsh-wallpaper-surface, 0.6) + 0.14)) !important;
  --dsw-alias-bg-layer-2: rgba(255, 255, 255, calc(var(--dsh-wallpaper-surface, 0.6) + 0.20)) !important;
  --dsw-alias-bg-overlay: rgba(250, 250, 252, 0.97) !important;
  --dsw-specific-sidebar-fill: rgba(249, 250, 251, calc(var(--dsh-wallpaper-surface, 0.6) + 0.08)) !important;
}

:root[data-dsh-wallpaper="on"] body[data-ds-dark-theme] {
  background-color: #101114 !important;
  --dsw-alias-bg-base: rgba(21, 21, 23, var(--dsh-wallpaper-surface, 0.6)) !important;
  --dsw-alias-bg-layer-1: rgba(35, 35, 36, calc(var(--dsh-wallpaper-surface, 0.6) + 0.14)) !important;
  --dsw-alias-bg-layer-2: rgba(44, 44, 46, calc(var(--dsh-wallpaper-surface, 0.6) + 0.20)) !important;
  --dsw-alias-bg-overlay: rgba(30, 30, 33, 0.97) !important;
  --dsw-specific-sidebar-fill: rgba(27, 27, 28, calc(var(--dsh-wallpaper-surface, 0.6) + 0.08)) !important;
}

/* "No mask" removes the wash and drives the shell/sidebar almost fully
   transparent, leaving the artwork clear with only a faint glass layer. */
:root[data-dsh-wallpaper-mask="none"] {
  --dsh-wallpaper-dim: 0 !important;
}

:root[data-dsh-wallpaper-mask="none"] body {
  --dsh-wallpaper-surface: 0.02 !important;
}

/* Keep the text family coherent: primary text takes the chosen color and the
   quieter tiers keep the same hue at reduced opacity. */
:root[data-dsh-wallpaper-font="custom"] body {
  --dsw-alias-label-primary: var(--dsh-wallpaper-font-color) !important;
  --dsw-alias-label-primary-dimmed: color-mix(in srgb, var(--dsh-wallpaper-font-color) 84%, transparent) !important;
  --dsw-alias-label-primary-bluish: var(--dsh-wallpaper-font-color) !important;
  --dsw-alias-label-secondary: color-mix(in srgb, var(--dsh-wallpaper-font-color) 80%, transparent) !important;
  --dsw-alias-label-tertiary: color-mix(in srgb, var(--dsh-wallpaper-font-color) 68%, transparent) !important;
  --dsw-alias-label-caption: color-mix(in srgb, var(--dsh-wallpaper-font-color) 56%, transparent) !important;
}

:root[data-dsh-wallpaper="on"] #root {
  position: relative;
  z-index: 1;
  background: transparent !important;
}

/* The wallpaper lives inside the application root, so the startup workspace,
   the Hero, and every main panel see the same backdrop instead of relying on
   a transparent body behind an opaque shell. */
:root[data-dsh-wallpaper="on"] #root::before {
  content: "";
  position: fixed;
  inset: -40px;
  z-index: -1;
  pointer-events: none;
  background-color: #f4f5f7;
  background-image:
    linear-gradient(rgba(255, 255, 255, var(--dsh-wallpaper-dim, 0.18)), rgba(255, 255, 255, var(--dsh-wallpaper-dim, 0.18))),
    var(--dsh-wallpaper-image);
  background-position: center;
  background-repeat: no-repeat;
  background-size: auto, cover;
  filter: blur(var(--dsh-wallpaper-blur, 0px));
  transform: translateZ(0);
}

:root[data-dsh-wallpaper="on"] body[data-ds-dark-theme] #root::before {
  background-color: #101114;
  background-image:
    linear-gradient(rgba(0, 0, 0, var(--dsh-wallpaper-dim, 0.18)), rgba(0, 0, 0, var(--dsh-wallpaper-dim, 0.18))),
    var(--dsh-wallpaper-image);
}

:root[data-dsh-wallpaper="on"][data-dsh-wallpaper-fit="contain"] #root::before {
  background-size: auto, contain;
}

:root[data-dsh-wallpaper="on"][data-dsh-wallpaper-fit="tile"] #root::before {
  background-size: auto, 280px auto;
  background-repeat: no-repeat, repeat;
}

/* The frame is the workspace's own opaque base. Let the root backdrop show
   through it; the sidebar and conversation keep their themed tint on top. */
:root[data-dsh-wallpaper="on"] #root > [data-slot="root"] > * {
  background-color: transparent !important;
}

/* The empty/blank workspace is the landing Hero. Keep its large centered
   chrome on the image instead of repainting the conversation base color. */
:root[data-dsh-wallpaper="on"] #root [data-phase="hero"],
:root[data-dsh-wallpaper="on"] #root [data-phase="settling"] {
  background-color: transparent !important;
}

@media (prefers-reduced-transparency: reduce) {
  :root[data-dsh-wallpaper="on"] body {
    --dsh-wallpaper-surface: 0.9 !important;
  }
}

.dshw-page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 860px;
  padding: 4px 0 28px;
  color: var(--dsw-alias-label-primary);
}

.dshw-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}

.dshw-intro {
  margin: 4px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 20px;
}

.dshw-card {
  box-sizing: border-box;
  overflow: hidden;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 16px;
  background: var(--dsw-alias-bg-layer-1);
}

.dshw-preview {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 190px;
  aspect-ratio: 16 / 9;
  background-color: var(--dsw-alias-bg-layer-2);
  background-image:
    radial-gradient(circle at 18% 18%, rgba(52, 120, 246, 0.12), transparent 45%),
    radial-gradient(circle at 82% 84%, rgba(143, 137, 184, 0.14), transparent 48%);
  transition: outline-color 120ms ease, outline-offset 120ms ease;
  outline: 2px solid transparent;
  outline-offset: -2px;
}

.dshw-preview--drag {
  outline-color: var(--dsw-alias-brand-primary);
  outline-offset: -8px;
}

.dshw-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  color: var(--dsw-alias-label-secondary);
  text-align: center;
}

.dshw-placeholder-icon {
  display: block;
  width: 64px;
  height: 48px;
  margin-bottom: 2px;
  color: var(--dsw-alias-label-secondary);
}

.dshw-empty-title {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.dshw-empty-hint {
  max-width: 420px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}

.dshw-badge {
  corner-shape: round;
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 3px 9px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
  backdrop-filter: blur(8px);
}

.dshw-badge--on {
  border-color: transparent;
  background: var(--dsw-alias-brand-primary);
  color: #fff;
}

.dshw-processing {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  backdrop-filter: blur(12px);
}

.dshw-spinner {
  corner-shape: round;
  width: 16px;
  height: 16px;
  border: 2px solid var(--dsw-alias-border-l2);
  border-top-color: var(--dsw-alias-brand-primary);
  border-radius: 50%;
  animation: dshw-spin 0.8s linear infinite;
}

@keyframes dshw-spin {
  to { transform: rotate(360deg); }
}

.dshw-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}

.dshw-file {
  display: none;
}

.dshw-button {
  box-sizing: border-box;
  min-height: 32px;
  padding: 0 14px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dshw-button:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2);
}

.dshw-button--primary {
  border-color: transparent;
  background: var(--dsw-alias-brand-primary);
  color: #fff;
}

.dshw-button--primary:hover:not(:disabled) {
  filter: brightness(0.94);
}

.dshw-button:disabled,
.dshw-segment:disabled,
.dshw-slider input:disabled {
  cursor: default;
  opacity: 0.45;
}

.dshw-button:focus-visible,
.dshw-segment:focus-visible,
.dshw-switch input:focus-visible + .dshw-switch-track,
.dshw-slider input:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dshw-filename {
  min-width: 0;
  margin-left: auto;
  overflow: hidden;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshw-error,
.dshw-warning {
  margin: 0;
  padding: 0 16px 14px;
  font-size: 12px;
  line-height: 18px;
}

.dshw-error { color: var(--dsw-alias-state-error-primary); }
.dshw-warning { color: var(--dsw-alias-state-warn-primary); }

.dshw-settings {
  padding: 0 16px;
}

.dshw-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
}

.dshw-row + .dshw-row {
  border-top: 0.5px solid var(--dsw-alias-border-l2);
}

.dshw-row-copy {
  min-width: 0;
  flex: 1 1 auto;
}

.dshw-row-title {
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.dshw-row-desc {
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}

.dshw-row-control {
  flex: 0 0 auto;
}

.dshw-switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.dshw-switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.dshw-switch-track {
  corner-shape: round;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  width: 36px;
  height: 20px;
  padding: 2px;
  border-radius: 999px;
  background: var(--dsw-alias-border-l2);
  transition: background 120ms ease;
}

.dshw-switch-thumb {
  corner-shape: round;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: transform 120ms ease;
}

.dshw-switch input:checked + .dshw-switch-track {
  background: var(--dsw-alias-brand-primary);
}

.dshw-switch input:checked + .dshw-switch-track .dshw-switch-thumb {
  transform: translateX(16px);
}

.dshw-segments {
  box-sizing: border-box;
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
}

.dshw-segment {
  min-height: 26px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dshw-segment:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary);
}

.dshw-segment--on {
  background: var(--dsw-alias-brand-primary);
  color: #fff;
}

.dshw-segment--on:hover:not(:disabled) {
  color: #fff;
}

.dshw-color-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  max-width: 100%;
}

.dshw-color-input {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 9px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  cursor: pointer;
}

.dshw-color-input:has(input:disabled) {
  opacity: 0.45;
  cursor: default;
}

.dshw-color-input input[type="color"] {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.dshw-color-input input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.dshw-color-input input[type="color"]::-webkit-color-swatch {
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
}

.dshw-color-input input[type="color"]:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dshw-slider {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;
}

.dshw-slider input {
  width: 160px;
  accent-color: var(--dsw-alias-brand-primary);
  cursor: pointer;
}

.dshw-value {
  width: 40px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.dshw-note {
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
}

.dshw-note--muted {
  color: var(--dsw-alias-label-secondary);
  opacity: 0.8;
}

@media (max-width: 720px) {
  .dshw-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .dshw-row-control {
    align-self: flex-start;
  }

  .dshw-slider {
    width: 100%;
  }

  .dshw-slider input {
    flex: 1 1 auto;
    width: auto;
  }

  .dshw-filename {
    flex-basis: 100%;
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dshw-preview,
  .dshw-switch-track,
  .dshw-switch-thumb {
    transition: none;
  }
}
`

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const store = createStore()
        const t = ctx.locale.bind(NS)

        ctx.effect(() => {
          const offEn = ctx.locale.register(NS, 'en', EN)
          const offZh = ctx.locale.register(NS, 'zh', ZH)
          return () => {
            offEn()
            offZh()
          }
        }, 'dsh-wallpaper: dictionaries')

        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshWallpaper = 'global'
          style.textContent = GLOBAL_CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, 'dsh-wallpaper: global styles')

        ctx.effect(() => {
          const sync = () => applyState(store.getSnapshot())
          sync()
          const off = store.subscribe(sync)
          return () => {
            off()
            clearApplied()
          }
        }, 'dsh-wallpaper: applied background')

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'wallpaper',
          order: 49,
          label: () => t('navLabel'),
          inject: () => ({ store, t, locale: ctx.locale }),
        }, SettingsPage))
      },
    }
  },
})
