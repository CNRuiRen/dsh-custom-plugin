window.__ModuleLoader__.load({
  id: 'dsh-wallpaper-cnr',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useRef, useState, useSyncExternalStore } = React

    const NS = 'dsh-wallpaper'
    const LEGACY_PREFS_KEY = 'dsh-wallpaper:v1:prefs'
    const LEGACY_IMAGE_KEY = 'dsh-wallpaper:v1:image'
    const PROFILES_KEY = 'dsh-wallpaper:v1:profiles'
    const MAX_PROFILES = 3 // Increase this and MAX_PROFILES in the docs together.
    const MAX_PROFILE_FILE_BYTES = 20 * 1024 * 1024
    const MAX_FILE_BYTES = 30 * 1024 * 1024
    const MAX_DATA_CHARS = 3000000
    const FITS = ['cover', 'contain', 'tile']
    const MASKS = ['soft', 'none']
    const HEX_COLOR = /^#[0-9a-f]{6}$/i

    const profilePrefsKey = (id) => `dsh-wallpaper:v1:profile:${id}:prefs`
    const profileImageKey = (id) => `dsh-wallpaper:v1:profile:${id}:image`
    const profileId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

    const EN = {
      navLabel: 'Wallpaper',
      title: 'Wallpaper',
      intro: 'Use your own image behind the DeepSeek Harness workspace, including the startup screen.',
      profiles: 'Configurations',
      profileNew: 'New',
      profileExport: 'Export',
      profileImport: 'Import',
      profileDelete: 'Delete',
      profileName: 'Name',
      profileDefault: 'Default',
      profileLimit: 'At most 3 local configurations are allowed. Delete one before adding another.',
      profileMin: 'Keep at least one configuration.',
      profileInvalid: 'This file is not a valid wallpaper configuration.',
      profileTooLarge: 'The configuration file is too large.',
      profileStorage: 'The browser could not save this configuration.',
      profileNameError: 'Enter a configuration name.',
      profileDeleteConfirm: 'Delete this configuration?',
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
      scheme: 'Quick palette',
      schemeDesc: 'Apply a matched text, panel, and highlight palette. Best paired with No mask.',
      schemeTheme: 'Theme',
      schemeDark: 'Dark glass',
      schemeLight: 'Light glass',
      fontColor: 'Text color',
      fontColorDesc: 'Pick a color with enough contrast for your image. Best paired with No mask.',
      fontAuto: 'Theme',
      fontWhite: 'White',
      fontBlack: 'Dark',
      fontCustom: 'Custom',
      panelColor: 'Dialog / card color',
      panelColorDesc: 'Background for dialogs, settings cards, inputs, message bubbles, and the sidebar top field.',
      panelOpacity: 'Panel opacity',
      highlightColor: 'Highlight color',
      highlightColorDesc: 'Background for inline code, code blocks, tags, and hover selections.',
      highlightOpacity: 'Highlight opacity',
      buttonColor: 'Button background',
      buttonColorDesc: 'Fill for primary actions, send, toolbar, the new-session field, and the round add control.',
      buttonOpacity: 'Button background opacity',
      buttonTextColor: 'Button color',
      buttonTextColorDesc: 'Text and icon color inside buttons; Auto contrast follows the button background.',
      buttonTextAuto: 'Auto contrast',
      fileHeaderColor: 'File header color',
      fileHeaderColorDesc: 'Title background of file previews and file/code cards.',
      fileHeaderOpacity: 'Header opacity',
      selectionColor: 'Selection color',
      selectionColorDesc: 'Background for selected navigation rows and selected text.',
      selectionOpacity: 'Selection opacity',
      selectionTextColor: 'Selected text color',
      selectionTextColorDesc: 'Auto contrast follows the selection color; pick a custom color to override it.',
      selectionTextAuto: 'Auto contrast',
      modalMask: 'Popup mask',
      modalMaskDesc: 'Darkness behind modal dialogs, independent of the wallpaper shade.',
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
      profiles: '配置方案',
      profileNew: '新建',
      profileExport: '导出',
      profileImport: '导入',
      profileDelete: '删除',
      profileName: '名称',
      profileDefault: '默认方案',
      profileLimit: '本地最多保存 3 个配置方案；请先删除一个再新建或导入。',
      profileMin: '至少保留一个配置方案。',
      profileInvalid: '这个文件不是有效的背景配置。',
      profileTooLarge: '配置文件太大，无法导入。',
      profileStorage: '浏览器无法保存这个配置。',
      profileNameError: '请输入配置名称。',
      profileDeleteConfirm: '确定删除当前配置方案吗？',
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
      scheme: '快捷配色',
      schemeDesc: '一键匹配文字、对话框和高亮框；建议搭配“无遮罩”使用。',
      schemeTheme: '跟随主题',
      schemeDark: '深色玻璃',
      schemeLight: '浅色玻璃',
      fontColor: '字体颜色',
      fontColorDesc: '选择与背景图片对比清晰的颜色，建议搭配“无遮罩”使用。',
      fontAuto: '跟随主题',
      fontWhite: '白色',
      fontBlack: '深色',
      fontCustom: '自定义',
      panelColor: '对话框 / 卡片颜色',
      panelColorDesc: '对话框、设置卡片、输入框、消息气泡和侧栏顶部输入区的背景色。',
      panelOpacity: '面板不透明度',
      highlightColor: '高亮框颜色',
      highlightColorDesc: '行内代码、代码块、标签和悬停高亮的背景色。',
      highlightOpacity: '高亮不透明度',
      buttonColor: '按钮背景颜色',
      buttonColorDesc: '主操作、发送、工具栏、左侧新建会话区域和圆形添加按钮的填充色。',
      buttonOpacity: '按钮背景不透明度',
      buttonTextColor: '按钮颜色',
      buttonTextColorDesc: '按钮内文字和图标的颜色；自动对比会根据按钮背景选择黑/白。',
      buttonTextAuto: '自动对比',
      fileHeaderColor: '文件标题背景',
      fileHeaderColorDesc: '文件预览、文件卡片和代码块标题的背景色。',
      fileHeaderOpacity: '标题不透明度',
      selectionColor: '选中颜色',
      selectionColorDesc: '左侧导航选中项、选中的标签和文字光标的背景色。',
      selectionOpacity: '选中不透明度',
      selectionTextColor: '选中文字颜色',
      selectionTextColorDesc: '自动对比会根据选中颜色选择黑/白文字，也可以自定义。',
      selectionTextAuto: '自动对比',
      modalMask: '弹窗遮罩',
      modalMaskDesc: '独立调节弹出窗口背后的暗色遮罩。',
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
      panelColor: 'auto',
      panelOpacity: 68,
      highlightColor: 'auto',
      highlightOpacity: 28,
      buttonColor: 'auto',
      buttonOpacity: 100,
      buttonTextColor: 'auto',
      fileHeaderColor: 'auto',
      fileHeaderOpacity: 32,
      selectionColor: 'auto',
      selectionOpacity: 88,
      selectionTextColor: 'auto',
      modalMask: 24,
      intensity: 45,
      blur: 0,
      dim: 18,
      image: '',
      imageName: '',
      profiles: [],
      activeProfile: '',
      profileName: '',
      profileError: null,
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
      '--dsh-wallpaper-panel',
      '--dsh-wallpaper-highlight',
      '--dsh-wallpaper-button',
      '--dsh-wallpaper-button-text',
      '--dsh-wallpaper-file-header',
      '--dsh-wallpaper-selection',
      '--dsh-wallpaper-selection-text',
      '--dsh-wallpaper-modal-mask',
    ]

    function clamp(value, min, max) {
      const number = Number(value)
      if (!Number.isFinite(number)) return min
      return Math.min(max, Math.max(min, number))
    }

    function clampOr(value, fallback, min, max) {
      const number = Number(value)
      if (!Number.isFinite(number)) return fallback
      return Math.min(max, Math.max(min, number))
    }

    function hexToRgba(hex, opacity) {
      const value = hex.slice(1)
      const red = Number.parseInt(value.slice(0, 2), 16)
      const green = Number.parseInt(value.slice(2, 4), 16)
      const blue = Number.parseInt(value.slice(4, 6), 16)
      return `rgba(${red}, ${green}, ${blue}, ${clamp(opacity, 0, 100) / 100})`
    }

    function isLightColor(hex) {
      const value = hex.slice(1)
      const channels = [0, 2, 4].map((offset) => {
        const channel = Number.parseInt(value.slice(offset, offset + 2), 16) / 255
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
      })
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.55
    }

    function applySavedPrefs(state, saved) {
      if (typeof saved.enabled === 'boolean') state.enabled = saved.enabled
      if (FITS.includes(saved.fit)) state.fit = saved.fit
      if (MASKS.includes(saved.mask)) state.mask = saved.mask
      if (saved.fontColor === 'auto' || (typeof saved.fontColor === 'string' && HEX_COLOR.test(saved.fontColor))) {
        state.fontColor = saved.fontColor
      }
      if (saved.panelColor === 'auto' || (typeof saved.panelColor === 'string' && HEX_COLOR.test(saved.panelColor))) {
        state.panelColor = saved.panelColor
      }
      if (saved.highlightColor === 'auto' || (typeof saved.highlightColor === 'string' && HEX_COLOR.test(saved.highlightColor))) {
        state.highlightColor = saved.highlightColor
      }
      if (saved.buttonColor === 'auto' || (typeof saved.buttonColor === 'string' && HEX_COLOR.test(saved.buttonColor))) {
        state.buttonColor = saved.buttonColor
      }
      if (saved.buttonTextColor === 'auto' || (typeof saved.buttonTextColor === 'string' && HEX_COLOR.test(saved.buttonTextColor))) {
        state.buttonTextColor = saved.buttonTextColor
      }
      if (saved.fileHeaderColor === 'auto' || (typeof saved.fileHeaderColor === 'string' && HEX_COLOR.test(saved.fileHeaderColor))) {
        state.fileHeaderColor = saved.fileHeaderColor
      }
      if (saved.selectionColor === 'auto' || (typeof saved.selectionColor === 'string' && HEX_COLOR.test(saved.selectionColor))) {
        state.selectionColor = saved.selectionColor
      }
      if (saved.selectionTextColor === 'auto' || (typeof saved.selectionTextColor === 'string' && HEX_COLOR.test(saved.selectionTextColor))) {
        state.selectionTextColor = saved.selectionTextColor
      }
      state.panelOpacity = clampOr(saved.panelOpacity, state.panelOpacity, 0, 100)
      state.highlightOpacity = clampOr(saved.highlightOpacity, state.highlightOpacity, 0, 100)
      state.buttonOpacity = clampOr(saved.buttonOpacity, state.buttonOpacity, 0, 100)
      state.fileHeaderOpacity = clampOr(saved.fileHeaderOpacity, state.fileHeaderOpacity, 0, 100)
      state.selectionOpacity = clampOr(saved.selectionOpacity, state.selectionOpacity, 0, 100)
      state.modalMask = clampOr(saved.modalMask, state.modalMask, 0, 80)
      state.intensity = clampOr(saved.intensity, state.intensity, 0, 100)
      state.blur = clampOr(saved.blur, state.blur, 0, 30)
      state.dim = clampOr(saved.dim, state.dim, 0, 60)
      if (typeof saved.imageName === 'string') state.imageName = saved.imageName
    }

    function deriveAutoSurfaces(state) {
      if (state.fontColor !== 'auto' && isLightColor(state.fontColor)) {
        // Older saved settings can contain white text with the original light
        // panels; derive readable dark surfaces without losing the text choice.
        if (state.panelColor === 'auto') {
          state.panelColor = '#0f131b'
          state.panelOpacity = 62
        }
        if (state.highlightColor === 'auto') {
          state.highlightColor = '#000000'
          state.highlightOpacity = 32
        }
        if (state.fileHeaderColor === 'auto') {
          state.fileHeaderColor = '#0f131b'
          state.fileHeaderOpacity = 55
        }
      }
      return state
    }

    function defaultRegistry() {
      return { version: 1, active: 'p1', items: [{ id: 'p1', name: '默认方案' }] }
    }

    function readRegistry() {
      const fallback = defaultRegistry()
      try {
        const raw = localStorage.getItem(PROFILES_KEY)
        if (raw) {
          const saved = JSON.parse(raw)
          if (Array.isArray(saved.items)) {
            const items = []
            const seen = new Set()
            for (const item of saved.items) {
              if (items.length >= MAX_PROFILES) break
              if (item === null || typeof item !== 'object') continue
              if (typeof item.id !== 'string' || !item.id || seen.has(item.id)) continue
              seen.add(item.id)
              items.push({
                id: item.id,
                name: typeof item.name === 'string' && item.name.trim() ? item.name.trim().slice(0, 40) : `方案 ${items.length + 1}`,
              })
            }
            if (items.length > 0) {
              const active = items.some((item) => item.id === saved.active) ? saved.active : items[0].id
              return { version: 1, active, items }
            }
          }
        }

        // First run: copy the pre-profile settings and image into profile p1.
        const legacyPrefs = localStorage.getItem(LEGACY_PREFS_KEY)
        const legacyImage = localStorage.getItem(LEGACY_IMAGE_KEY)
        if (legacyPrefs) localStorage.setItem(profilePrefsKey('p1'), legacyPrefs)
        if (legacyImage) localStorage.setItem(profileImageKey('p1'), legacyImage)
        if (legacyPrefs) localStorage.removeItem(LEGACY_PREFS_KEY)
        if (legacyImage) localStorage.removeItem(LEGACY_IMAGE_KEY)
        localStorage.setItem(PROFILES_KEY, JSON.stringify(fallback))
        return fallback
      } catch {
        return fallback
      }
    }

    function readProfileState(id) {
      const state = { ...DEFAULTS }
      try {
        let raw = localStorage.getItem(profilePrefsKey(id))
        if (!raw && id === 'p1') raw = localStorage.getItem(LEGACY_PREFS_KEY)
        if (raw) applySavedPrefs(state, JSON.parse(raw))
        let image = localStorage.getItem(profileImageKey(id))
        if (!image && id === 'p1') image = localStorage.getItem(LEGACY_IMAGE_KEY)
        if (typeof image === 'string' && image.startsWith('data:image/')) state.image = image
      } catch {
        state.storageError = true
      }
      deriveAutoSurfaces(state)
      if (!state.image) state.imageName = ''
      return state
    }

    function readState() {
      const registry = readRegistry()
      const active = registry.items.find((item) => item.id === registry.active) ?? registry.items[0]
      const state = readProfileState(active.id)
      state.profiles = registry.items
      state.activeProfile = active.id
      state.profileName = active.name
      return state
    }

    function savePrefs(state) {
      try {
        const id = state.activeProfile || 'p1'
        localStorage.setItem(profilePrefsKey(id), JSON.stringify({
          enabled: state.enabled,
          fit: state.fit,
          mask: state.mask,
          fontColor: state.fontColor,
          panelColor: state.panelColor,
          panelOpacity: state.panelOpacity,
          highlightColor: state.highlightColor,
          highlightOpacity: state.highlightOpacity,
          buttonColor: state.buttonColor,
          buttonOpacity: state.buttonOpacity,
          buttonTextColor: state.buttonTextColor,
          fileHeaderColor: state.fileHeaderColor,
          fileHeaderOpacity: state.fileHeaderOpacity,
          selectionColor: state.selectionColor,
          selectionOpacity: state.selectionOpacity,
          selectionTextColor: state.selectionTextColor,
          modalMask: state.modalMask,
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

    function saveRegistry(state) {
      try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify({
          version: 1,
          active: state.activeProfile,
          items: state.profiles,
        }))
        return true
      } catch {
        return false
      }
    }

    function prefsSnapshot(state) {
      return {
        enabled: state.enabled,
        fit: state.fit,
        mask: state.mask,
        fontColor: state.fontColor,
        panelColor: state.panelColor,
        panelOpacity: state.panelOpacity,
        highlightColor: state.highlightColor,
        highlightOpacity: state.highlightOpacity,
        buttonColor: state.buttonColor,
        buttonOpacity: state.buttonOpacity,
        buttonTextColor: state.buttonTextColor,
        fileHeaderColor: state.fileHeaderColor,
        fileHeaderOpacity: state.fileHeaderOpacity,
        selectionColor: state.selectionColor,
        selectionOpacity: state.selectionOpacity,
        selectionTextColor: state.selectionTextColor,
        modalMask: state.modalMask,
        intensity: state.intensity,
        blur: state.blur,
        dim: state.dim,
        imageName: state.imageName,
      }
    }

    function downloadProfile(state) {
      const payload = {
        schema: 'dsh-wallpaper-profile',
        version: 1,
        name: state.profileName || '默认方案',
        exportedAt: new Date().toISOString(),
        settings: prefsSnapshot(state),
        image: state.image || '',
        imageName: state.imageName || '',
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      const safeName = (state.profileName || 'dsh-wallpaper').replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 48)
      anchor.href = url
      anchor.download = `dsh-wallpaper-${safeName || 'profile'}.json`
      anchor.style.display = 'none'
      window.document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    function parseProfileFile(text) {
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('invalid')
      }
      if (data === null || typeof data !== 'object') throw new Error('invalid')
      if (data.schema !== 'dsh-wallpaper-profile' || data.version !== 1) throw new Error('invalid')
      if (data.settings === null || typeof data.settings !== 'object') throw new Error('invalid')
      const image = typeof data.image === 'string' ? data.image : ''
      if (image && !image.startsWith('data:image/')) throw new Error('invalid')
      const parsed = { ...DEFAULTS }
      applySavedPrefs(parsed, data.settings)
      parsed.image = image
      parsed.imageName = typeof data.imageName === 'string' ? data.imageName.slice(0, 200) : ''
      deriveAutoSurfaces(parsed)
      return {
        name: typeof data.name === 'string' && data.name.trim() ? data.name.trim().slice(0, 40) : '导入方案',
        prefs: prefsSnapshot(parsed),
        image,
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
      root.removeAttribute('data-dsh-wallpaper-panel')
      root.removeAttribute('data-dsh-wallpaper-highlight')
      root.removeAttribute('data-dsh-wallpaper-button')
      root.removeAttribute('data-dsh-wallpaper-button-text')
      root.removeAttribute('data-dsh-wallpaper-file-header')
      root.removeAttribute('data-dsh-wallpaper-selection')
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

      const panelColor = state.panelColor !== 'auto' && HEX_COLOR.test(state.panelColor) ? state.panelColor : ''
      if (panelColor) {
        root.setAttribute('data-dsh-wallpaper-panel', 'custom')
        root.style.setProperty('--dsh-wallpaper-panel', hexToRgba(panelColor, state.panelOpacity))
      } else {
        root.removeAttribute('data-dsh-wallpaper-panel')
        root.style.removeProperty('--dsh-wallpaper-panel')
      }

      const highlightColor = state.highlightColor !== 'auto' && HEX_COLOR.test(state.highlightColor) ? state.highlightColor : ''
      if (highlightColor) {
        root.setAttribute('data-dsh-wallpaper-highlight', 'custom')
        root.style.setProperty('--dsh-wallpaper-highlight', hexToRgba(highlightColor, state.highlightOpacity))
      } else {
        root.removeAttribute('data-dsh-wallpaper-highlight')
        root.style.removeProperty('--dsh-wallpaper-highlight')
      }

      const buttonColor = state.buttonColor !== 'auto' && HEX_COLOR.test(state.buttonColor) ? state.buttonColor : ''
      if (buttonColor) {
        root.setAttribute('data-dsh-wallpaper-button', 'custom')
        root.style.setProperty('--dsh-wallpaper-button', hexToRgba(buttonColor, state.buttonOpacity))
      } else {
        root.removeAttribute('data-dsh-wallpaper-button')
        root.style.removeProperty('--dsh-wallpaper-button')
      }

      const buttonText = state.buttonTextColor !== 'auto' && HEX_COLOR.test(state.buttonTextColor)
        ? state.buttonTextColor
        : (buttonColor ? (isLightColor(buttonColor) ? '#0f1115' : '#ffffff') : '')
      if (buttonText) {
        root.setAttribute('data-dsh-wallpaper-button-text', 'custom')
        root.style.setProperty('--dsh-wallpaper-button-text', buttonText)
      } else {
        root.removeAttribute('data-dsh-wallpaper-button-text')
        root.style.removeProperty('--dsh-wallpaper-button-text')
      }

      const fileHeaderColor = state.fileHeaderColor !== 'auto' && HEX_COLOR.test(state.fileHeaderColor) ? state.fileHeaderColor : ''
      if (fileHeaderColor) {
        root.setAttribute('data-dsh-wallpaper-file-header', 'custom')
        root.style.setProperty('--dsh-wallpaper-file-header', hexToRgba(fileHeaderColor, state.fileHeaderOpacity))
      } else {
        root.removeAttribute('data-dsh-wallpaper-file-header')
        root.style.removeProperty('--dsh-wallpaper-file-header')
      }

      const selectionColor = state.selectionColor !== 'auto' && HEX_COLOR.test(state.selectionColor) ? state.selectionColor : ''
      if (selectionColor) {
        const autoText = isLightColor(selectionColor) ? '#0f1115' : '#ffffff'
        const selectionText = state.selectionTextColor !== 'auto' && HEX_COLOR.test(state.selectionTextColor)
          ? state.selectionTextColor
          : autoText
        root.setAttribute('data-dsh-wallpaper-selection', 'custom')
        root.style.setProperty('--dsh-wallpaper-selection', hexToRgba(selectionColor, state.selectionOpacity))
        root.style.setProperty('--dsh-wallpaper-selection-text', selectionText)
      } else {
        root.removeAttribute('data-dsh-wallpaper-selection')
        root.style.removeProperty('--dsh-wallpaper-selection')
        root.style.removeProperty('--dsh-wallpaper-selection-text')
      }

      root.style.setProperty('--dsh-wallpaper-image', 'url("' + state.image + '")')
      root.style.setProperty('--dsh-wallpaper-surface', String(surfaceAlpha(state.intensity).toFixed(3)))
      root.style.setProperty('--dsh-wallpaper-dim', String(clamp(state.dim, 0, 60) / 100))
      root.style.setProperty('--dsh-wallpaper-blur', clamp(state.blur, 0, 30) + 'px')
      root.style.setProperty('--dsh-wallpaper-modal-mask', String(clamp(state.modalMask, 0, 80) / 100))
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
            localStorage.setItem(profileImageKey(state.activeProfile || 'p1'), data)
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
          localStorage.removeItem(profileImageKey(state.activeProfile || 'p1'))
        } catch {
          // The in-memory image still clears below.
        }
        commit({ image: '', imageName: '', busy: false, error: null })
      }

      const publish = (next) => {
        state = next
        emit()
      }

      const failProfile = (code) => {
        state = { ...state, profileError: code }
        emit()
      }

      const switchProfile = (id) => {
        if (id === state.activeProfile) return
        const item = state.profiles.find((profile) => profile.id === id)
        if (!item) return
        uploadToken++
        const registry = { version: 1, active: id, items: state.profiles }
        try {
          localStorage.setItem(PROFILES_KEY, JSON.stringify(registry))
        } catch {
          failProfile('storage')
          return
        }
        const next = readProfileState(id)
        next.profiles = state.profiles
        next.activeProfile = id
        next.profileName = item.name
        next.profileError = null
        publish(next)
      }

      const createProfile = () => {
        if (state.profiles.length >= MAX_PROFILES) {
          failProfile('limit')
          return
        }
        uploadToken++
        const id = profileId()
        const baseName = `方案 ${state.profiles.length + 1}`
        let name = baseName
        const names = new Set(state.profiles.map((profile) => profile.name))
        let suffix = 1
        while (names.has(name)) name = `${baseName} (${++suffix})`
        try {
          localStorage.setItem(profilePrefsKey(id), JSON.stringify(prefsSnapshot(state)))
          if (state.image) localStorage.setItem(profileImageKey(id), state.image)
        } catch {
          failProfile('storage')
          return
        }
        const items = [...state.profiles, { id, name }]
        const next = readProfileState(id)
        next.profiles = items
        next.activeProfile = id
        next.profileName = name
        next.profileError = null
        saveRegistry(next)
        publish(next)
      }

      const deleteProfile = () => {
        if (state.profiles.length <= 1) {
          failProfile('min')
          return
        }
        uploadToken++
        const current = state.activeProfile
        try {
          localStorage.removeItem(profilePrefsKey(current))
          localStorage.removeItem(profileImageKey(current))
        } catch {
          failProfile('storage')
          return
        }
        const items = state.profiles.filter((profile) => profile.id !== current)
        const next = readProfileState(items[0].id)
        next.profiles = items
        next.activeProfile = items[0].id
        next.profileName = items[0].name
        next.profileError = null
        saveRegistry(next)
        publish(next)
      }

      const renameProfile = (name) => {
        const clean = typeof name === 'string' ? name.trim().slice(0, 40) : ''
        if (!clean) {
          failProfile('name')
          return
        }
        const items = state.profiles.map((profile) => (
          profile.id === state.activeProfile ? { ...profile, name: clean } : profile
        ))
        const next = { ...state, profiles: items, profileName: clean, profileError: null }
        saveRegistry(next)
        publish(next)
      }

      const exportProfile = () => {
        try {
          downloadProfile(state)
        } catch {
          failProfile('storage')
        }
      }

      const importProfile = async (file) => {
        if (!file) return
        uploadToken++
        if (state.profiles.length >= MAX_PROFILES) {
          failProfile('limit')
          return
        }
        if (file.size > MAX_PROFILE_FILE_BYTES) {
          failProfile('tooLarge')
          return
        }
        try {
          const parsed = parseProfileFile(await file.text())
          const id = profileId()
          let name = parsed.name
          const names = new Set(state.profiles.map((profile) => profile.name))
          let suffix = 1
          while (names.has(name)) name = `${parsed.name} (${++suffix})`
          localStorage.setItem(profilePrefsKey(id), JSON.stringify(parsed.prefs))
          if (parsed.image) localStorage.setItem(profileImageKey(id), parsed.image)
          const items = [...state.profiles, { id, name }]
          const next = readProfileState(id)
          next.profiles = items
          next.activeProfile = id
          next.profileName = name
          next.profileError = null
          saveRegistry(next)
          publish(next)
        } catch (error) {
          failProfile(error instanceof Error && error.message === 'invalid' ? 'invalid' : 'storage')
        }
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
            const patch = { fontColor: value }
            // White/light text on the default light highlight is the exact
            // white-on-white failure seen after changing a wallpaper.
            if (value !== 'auto' && isLightColor(value)) {
              if (state.panelColor === 'auto') {
                patch.panelColor = '#0f131b'
                patch.panelOpacity = 62
              }
              if (state.highlightColor === 'auto') {
                patch.highlightColor = '#000000'
                patch.highlightOpacity = 32
              }
              if (state.fileHeaderColor === 'auto') {
                patch.fileHeaderColor = '#0f131b'
                patch.fileHeaderOpacity = 55
              }
            }
            commit(patch)
          } else if (key === 'panelColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ panelColor: value })
          } else if (key === 'highlightColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ highlightColor: value })
          } else if (key === 'buttonColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ buttonColor: value })
          } else if (key === 'buttonTextColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ buttonTextColor: value })
          } else if (key === 'fileHeaderColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ fileHeaderColor: value })
          } else if (key === 'selectionColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ selectionColor: value })
          } else if (key === 'selectionTextColor' && (value === 'auto' || HEX_COLOR.test(value))) {
            commit({ selectionTextColor: value })
          } else if (key === 'panelOpacity') {
            commit({ panelOpacity: clamp(value, 0, 100) })
          } else if (key === 'highlightOpacity') {
            commit({ highlightOpacity: clamp(value, 0, 100) })
          } else if (key === 'buttonOpacity') {
            commit({ buttonOpacity: clamp(value, 0, 100) })
          } else if (key === 'fileHeaderOpacity') {
            commit({ fileHeaderOpacity: clamp(value, 0, 100) })
          } else if (key === 'selectionOpacity') {
            commit({ selectionOpacity: clamp(value, 0, 100) })
          } else if (key === 'modalMask') {
            commit({ modalMask: clamp(value, 0, 80) })
          }
        },
        switchProfile,
        createProfile,
        deleteProfile,
        renameProfile,
        exportProfile,
        importProfile,
        applyPreset: (name) => {
          if (name === 'dark') {
            commit({
              fontColor: '#ffffff',
              panelColor: '#0f131b',
              panelOpacity: 62,
              highlightColor: '#000000',
              highlightOpacity: 32,
              fileHeaderColor: '#0f131b',
              fileHeaderOpacity: 55,
              modalMask: 42,
            })
          } else if (name === 'light') {
            commit({
              fontColor: '#0f1115',
              panelColor: '#ffffff',
              panelOpacity: 80,
              highlightColor: '#000000',
              highlightOpacity: 8,
              fileHeaderColor: '#ffffff',
              fileHeaderOpacity: 70,
              modalMask: 20,
            })
          } else if (name === 'theme') {
            commit({
              fontColor: 'auto',
              panelColor: 'auto',
              highlightColor: 'auto',
              buttonColor: 'auto',
              buttonTextColor: 'auto',
              fileHeaderColor: 'auto',
              selectionColor: 'auto',
              selectionTextColor: 'auto',
              panelOpacity: 68,
              highlightOpacity: 28,
              modalMask: 24,
            })
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

    function profileErrorText(t, code) {
      if (code === 'limit') return t('profileLimit')
      if (code === 'min') return t('profileMin')
      if (code === 'invalid') return t('profileInvalid')
      if (code === 'tooLarge') return t('profileTooLarge')
      if (code === 'name') return t('profileNameError')
      return t('profileStorage')
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

    function ColorOpacity(props) {
      const auto = props.color === 'auto'
      return h('div', { className: 'dshw-color-stack' },
        h('div', { className: 'dshw-color-control' },
          h('label', { className: 'dshw-color-input', title: props.label },
            h('input', {
              type: 'color',
              value: auto ? '#808080' : props.color,
              'aria-label': props.label,
              disabled: props.disabled,
              onChange: (event) => props.onColor(event.target.value),
            }),
            h('span', null, auto ? props.autoLabel : props.customLabel),
          ),
          auto ? null : h('button', {
            type: 'button',
            className: 'dshw-mini-button',
            onClick: props.onAuto,
          }, props.autoLabel),
        ),
        h(Slider, {
          label: props.opacityLabel,
          min: 0,
          max: 100,
          value: auto ? 0 : props.opacity,
          suffix: '%',
          disabled: props.disabled || auto,
          onChange: props.onOpacity,
        }),
      )
    }

    function ColorOnly(props) {
      const auto = props.color === 'auto'
      return h('div', { className: 'dshw-color-control' },
        h('label', { className: 'dshw-color-input', title: props.label },
          h('input', {
            type: 'color',
            value: auto ? '#ffffff' : props.color,
            'aria-label': props.label,
            disabled: props.disabled,
            onChange: (event) => props.onColor(event.target.value),
          }),
          h('span', null, auto ? props.autoLabel : props.customLabel),
        ),
        auto ? null : h('button', {
          type: 'button',
          className: 'dshw-mini-button',
          onClick: props.onAuto,
        }, props.autoLabel),
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
      const importRef = useRef(null)
      const [dragging, setDragging] = useState(false)
      const profiles = state.profiles.length
        ? state.profiles
        : [{ id: state.activeProfile || 'p1', name: state.profileName || t('profileDefault') }]

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

        h('div', { className: 'dshw-card dshw-profiles' },
          h('div', { className: 'dshw-profile-head' },
            h('div', { className: 'dshw-profile-title' },
              t('profiles'),
              h('span', { className: 'dshw-profile-count' }, `${profiles.length}/${MAX_PROFILES}`),
            ),
            h('div', { className: 'dshw-profile-actions' },
              h('button', {
                type: 'button',
                className: 'dshw-button dshw-button--small',
                disabled: profiles.length >= MAX_PROFILES,
                onClick: store.createProfile,
              }, t('profileNew')),
              h('button', {
                type: 'button',
                className: 'dshw-button dshw-button--small',
                disabled: profiles.length >= MAX_PROFILES,
                onClick: () => importRef.current && importRef.current.click(),
              }, t('profileImport')),
              h('button', {
                type: 'button',
                className: 'dshw-button dshw-button--small',
                onClick: store.exportProfile,
              }, t('profileExport')),
              h('button', {
                type: 'button',
                className: 'dshw-button dshw-button--small',
                disabled: profiles.length <= 1,
                onClick: () => {
                  if (window.confirm(t('profileDeleteConfirm'))) store.deleteProfile()
                },
              }, t('profileDelete')),
            ),
          ),
          h('div', { className: 'dshw-profile-tabs' },
            profiles.map((profile) => h('button', {
              key: profile.id,
              type: 'button',
              className: 'dshw-profile-tab' + (profile.id === state.activeProfile ? ' dshw-profile-tab--on' : ''),
              'aria-pressed': profile.id === state.activeProfile,
              onClick: () => store.switchProfile(profile.id),
            }, profile.name)),
          ),
          h('label', { className: 'dshw-profile-name' },
            h('span', null, t('profileName')),
            h('input', {
              key: state.activeProfile,
              type: 'text',
              defaultValue: state.profileName,
              maxLength: 40,
              onBlur: (event) => store.renameProfile(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
              },
            }),
          ),
          h('input', {
            ref: importRef,
            className: 'dshw-file',
            type: 'file',
            accept: '.json,application/json',
            onChange: (event) => {
              const file = event.target.files && event.target.files[0]
              if (file) store.importProfile(file)
              event.target.value = ''
            },
          }),
          state.profileError
            ? h('p', { className: 'dshw-error dshw-profile-error', role: 'alert' }, profileErrorText(t, state.profileError))
            : null,
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
            title: t('scheme'),
            desc: t('schemeDesc'),
          }, h('div', { className: 'dshw-presets' },
            h('button', {
              type: 'button',
              className: 'dshw-button dshw-button--small',
              disabled: !state.image,
              onClick: () => store.applyPreset('theme'),
            }, t('schemeTheme')),
            h('button', {
              type: 'button',
              className: 'dshw-button dshw-button--small',
              disabled: !state.image,
              onClick: () => store.applyPreset('dark'),
            }, t('schemeDark')),
            h('button', {
              type: 'button',
              className: 'dshw-button dshw-button--small',
              disabled: !state.image,
              onClick: () => store.applyPreset('light'),
            }, t('schemeLight')),
          )),

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
            title: t('panelColor'),
            desc: t('panelColorDesc'),
          }, h(ColorOpacity, {
            label: t('panelColor'),
            opacityLabel: t('panelOpacity'),
            autoLabel: t('fontAuto'),
            customLabel: t('fontCustom'),
            color: state.panelColor,
            opacity: state.panelOpacity,
            disabled: !state.image,
            onColor: (value) => store.setField('panelColor', value),
            onAuto: () => store.setField('panelColor', 'auto'),
            onOpacity: (value) => store.setField('panelOpacity', value),
          })),

          h(Row, {
            title: t('highlightColor'),
            desc: t('highlightColorDesc'),
          }, h(ColorOpacity, {
            label: t('highlightColor'),
            opacityLabel: t('highlightOpacity'),
            autoLabel: t('fontAuto'),
            customLabel: t('fontCustom'),
            color: state.highlightColor,
            opacity: state.highlightOpacity,
            disabled: !state.image,
            onColor: (value) => store.setField('highlightColor', value),
            onAuto: () => store.setField('highlightColor', 'auto'),
            onOpacity: (value) => store.setField('highlightOpacity', value),
          })),

          h(Row, {
            title: t('buttonTextColor'),
            desc: t('buttonTextColorDesc'),
          }, h(ColorOnly, {
            label: t('buttonTextColor'),
            autoLabel: t('buttonTextAuto'),
            customLabel: t('fontCustom'),
            color: state.buttonTextColor,
            disabled: !state.image,
            onColor: (value) => store.setField('buttonTextColor', value),
            onAuto: () => store.setField('buttonTextColor', 'auto'),
          })),

          h(Row, {
            title: t('buttonColor'),
            desc: t('buttonColorDesc'),
          }, h(ColorOpacity, {
            label: t('buttonColor'),
            opacityLabel: t('buttonOpacity'),
            autoLabel: t('fontAuto'),
            customLabel: t('fontCustom'),
            color: state.buttonColor,
            opacity: state.buttonOpacity,
            disabled: !state.image,
            onColor: (value) => store.setField('buttonColor', value),
            onAuto: () => store.setField('buttonColor', 'auto'),
            onOpacity: (value) => store.setField('buttonOpacity', value),
          })),

          h(Row, {
            title: t('fileHeaderColor'),
            desc: t('fileHeaderColorDesc'),
          }, h(ColorOpacity, {
            label: t('fileHeaderColor'),
            opacityLabel: t('fileHeaderOpacity'),
            autoLabel: t('fontAuto'),
            customLabel: t('fontCustom'),
            color: state.fileHeaderColor,
            opacity: state.fileHeaderOpacity,
            disabled: !state.image,
            onColor: (value) => store.setField('fileHeaderColor', value),
            onAuto: () => store.setField('fileHeaderColor', 'auto'),
            onOpacity: (value) => store.setField('fileHeaderOpacity', value),
          })),

          h(Row, {
            title: t('selectionColor'),
            desc: t('selectionColorDesc'),
          }, h(ColorOpacity, {
            label: t('selectionColor'),
            opacityLabel: t('selectionOpacity'),
            autoLabel: t('fontAuto'),
            customLabel: t('fontCustom'),
            color: state.selectionColor,
            opacity: state.selectionOpacity,
            disabled: !state.image,
            onColor: (value) => store.setField('selectionColor', value),
            onAuto: () => store.setField('selectionColor', 'auto'),
            onOpacity: (value) => store.setField('selectionOpacity', value),
          })),

          h(Row, {
            title: t('selectionTextColor'),
            desc: t('selectionTextColorDesc'),
          }, h(ColorOnly, {
            label: t('selectionTextColor'),
            autoLabel: t('selectionTextAuto'),
            customLabel: t('fontCustom'),
            color: state.selectionTextColor,
            disabled: !state.image || state.selectionColor === 'auto',
            onColor: (value) => store.setField('selectionTextColor', value),
            onAuto: () => store.setField('selectionTextColor', 'auto'),
          })),

          h(Row, {
            title: t('modalMask'),
            desc: t('modalMaskDesc'),
          }, h(Slider, {
            label: t('modalMask'),
            min: 0,
            max: 80,
            value: state.modalMask,
            suffix: '%',
            disabled: !state.image,
            onChange: (value) => store.setField('modalMask', value),
          })),

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
  --dsw-alias-bg-mask-1: rgba(0, 0, 0, var(--dsh-wallpaper-modal-mask, 0.24)) !important;
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

/* User-tunable dialog / bubble / card surfaces. The panel color is an RGBA
   value computed from the chosen color and its opacity. */
:root[data-dsh-wallpaper-panel="custom"] body {
  --dsw-alias-bg-layer-1: var(--dsh-wallpaper-panel) !important;
  --dsw-alias-bg-layer-2: var(--dsh-wallpaper-panel) !important;
  --dsw-alias-bg-layer-3: var(--dsh-wallpaper-panel) !important;
  --dsw-alias-settings-card-fill: var(--dsh-wallpaper-panel) !important;
  --dsw-alias-bg-overlay: var(--dsh-wallpaper-panel) !important;
  --dsw-specific-bubble: var(--dsh-wallpaper-panel) !important;
  --dsw-specific-input-major: var(--dsh-wallpaper-panel) !important;
}

/* Inline code, code blocks, tags, and hover/selected backgrounds. */
:root[data-dsh-wallpaper-highlight="custom"] body {
  --dsw-alias-markdown-inline-code: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-markdown-code-block: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-markdown-code-block-banner: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-markdown-tag: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-markdown-citation: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-markdown-code-segment-selected: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-interactive-bg-hover: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-interactive-bg-hover-solid: var(--dsh-wallpaper-highlight) !important;
  --dsw-alias-state-business-tertiary: var(--dsh-wallpaper-highlight) !important;
  --dsw-specific-bubble-highlight: var(--dsh-wallpaper-highlight) !important;
}

/* Primary, info/send, and toolbar buttons share one user-chosen fill. */
:root[data-dsh-wallpaper-button="custom"] body {
  --dsw-alias-button-primary-fill: var(--dsh-wallpaper-button) !important;
  --dsw-alias-button-primary-hover: color-mix(in srgb, var(--dsh-wallpaper-button) 86%, #000) !important;
  --dsw-alias-button-info-fill: var(--dsh-wallpaper-button) !important;
  --dsw-alias-button-info-hover: color-mix(in srgb, var(--dsh-wallpaper-button) 86%, #000) !important;
  --dsw-alias-button-tool-bar-fill: var(--dsh-wallpaper-button) !important;
  --dsw-alias-button-tool-bar-hover: color-mix(in srgb, var(--dsh-wallpaper-button) 86%, #000) !important;
  --dsw-alias-button-elevated-fill: var(--dsh-wallpaper-button) !important;
  --dsw-alias-button-floating-hover: color-mix(in srgb, var(--dsh-wallpaper-button) 86%, #000) !important;
  --dsw-specific-selector: var(--dsh-wallpaper-button) !important;
}

:root[data-dsh-wallpaper-button-text="custom"] button,
:root[data-dsh-wallpaper-button-text="custom"] [role="button"],
:root[data-dsh-wallpaper-button-text="custom"] input[type="button"],
:root[data-dsh-wallpaper-button-text="custom"] input[type="submit"] {
  color: var(--dsh-wallpaper-button-text) !important;
}

/* File preview / file card / code block title bars. */
:root[data-dsh-wallpaper-file-header="custom"] body {
  --dsw-alias-markdown-code-block-banner: var(--dsh-wallpaper-file-header) !important;
}

:root[data-dsh-wallpaper-file-header="custom"] [data-code-block-banner],
:root[data-dsh-wallpaper-file-header="custom"] [data-file-header],
:root[data-dsh-wallpaper-file-header="custom"] [data-diff-header] {
  background-color: var(--dsh-wallpaper-file-header) !important;
}

/* The changed-files summary and deliverable cards keep local fill variables
   instead of theme aliases; target their stable data hooks. */
:root[data-dsh-wallpaper-file-header="custom"] [data-changed-files] {
  --changes-fill: var(--dsh-wallpaper-file-header) !important;
  --changes-hover: color-mix(in srgb, var(--dsh-wallpaper-file-header) 86%, #000) !important;
}

:root[data-dsh-wallpaper-file-header="custom"] [data-after-changes] {
  --deliverable-fill: var(--dsh-wallpaper-file-header) !important;
  --deliverable-hover: color-mix(in srgb, var(--dsh-wallpaper-file-header) 86%, #000) !important;
}

/* Selected navigation rows, tabs, and text selection share one palette. */
:root[data-dsh-wallpaper-selection="custom"] body {
  --dsw-specific-sidebar-nav-item-active: var(--dsh-wallpaper-selection) !important;
  --dsw-specific-sidebar-nav-item-active-accent: var(--dsh-wallpaper-selection-text) !important;
  --dsw-alias-interactive-bg-active: var(--dsh-wallpaper-selection) !important;
  --dsw-alias-bg-multi-select: var(--dsh-wallpaper-selection) !important;
}

:root[data-dsh-wallpaper-selection="custom"] [aria-current="page"],
:root[data-dsh-wallpaper-selection="custom"] [aria-selected="true"],
:root[data-dsh-wallpaper-selection="custom"] [data-selected="true"],
:root[data-dsh-wallpaper-selection="custom"] [data-active="true"],
:root[data-dsh-wallpaper-selection="custom"] [role="dialog"] nav button[class*="active"],
:root[data-dsh-wallpaper-selection="custom"] [role="dialog"] nav button[class*="selected"] {
  background-color: var(--dsh-wallpaper-selection) !important;
  color: var(--dsh-wallpaper-selection-text) !important;
}

:root[data-dsh-wallpaper-selection="custom"] ::selection {
  background: var(--dsh-wallpaper-selection) !important;
  color: var(--dsh-wallpaper-selection-text) !important;
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

.dshw-profiles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
}

.dshw-profile-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.dshw-profile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.dshw-profile-count {
  corner-shape: round;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
}

.dshw-profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dshw-profile-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dshw-profile-tab {
  min-height: 30px;
  padding: 0 12px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dshw-profile-tab:hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
}

.dshw-profile-tab--on {
  border-color: transparent;
  background: var(--dsw-alias-brand-primary);
  color: #fff;
}

.dshw-profile-tab--on:hover {
  background: var(--dsw-alias-brand-primary);
  color: #fff;
}

.dshw-profile-tab:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}

.dshw-profile-name {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.dshw-profile-name input {
  box-sizing: border-box;
  flex: 1 1 auto;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 9px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
}

.dshw-profile-name input:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}

.dshw-profile-error {
  padding: 0;
  margin: 0;
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

.dshw-button--small {
  min-height: 30px;
  padding: 0 10px;
  border-radius: 9px;
  font-size: 12px;
}

.dshw-presets {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 100%;
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

.dshw-color-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  max-width: 100%;
}

.dshw-mini-button {
  height: 28px;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.dshw-mini-button:hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-layer-2);
}

.dshw-mini-button:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
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

  .dshw-color-stack {
    align-items: flex-start;
  }

  .dshw-presets {
    justify-content: flex-start;
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
          order: 60,
          label: () => t('navLabel'),
          inject: () => ({ store, t, locale: ctx.locale }),
        }, SettingsPage))
      },
    }
  },
})
