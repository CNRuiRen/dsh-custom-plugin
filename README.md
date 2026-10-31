# DSH Wallpaper

A local DeepSeek Harness Web UI plugin that adds a **Wallpaper** settings page.

Upload your own image and use it behind the startup workspace, the blank-session Hero, conversations, and the sidebars.

## Features

- Upload JPG, PNG, WebP, or any image the browser can decode.
- Images are resized and compressed in the browser before storage.
- Fill, fit, or tile the image.
- Tune background visibility, blur, and shade.
- **No mask** mode keeps the artwork clear and overlays a nearly transparent shell.
- Text color presets (theme, white, dark) plus a custom color picker.
- Turn the wallpaper off without deleting the image.
- The image and preferences stay in this browser's local storage. Nothing is uploaded to a server.

The plugin is client-only: the Host half is an empty bundle entry and the browser module owns rendering and storage.

## Install

The repository must be public. In the DeepSeek Harness Web UI:

1. Open **Plugins**.
2. Choose **Add plugin → Install a third-party plugin**.
3. Paste the Git address:

   ```text
   github:OWNER/dsh-wallpaper
   ```

4. Install and enable the bundle.

Or from a terminal:

```sh
dsh plugin --profile <profile> add github:OWNER/dsh-wallpaper
```

Replace `OWNER` with the GitHub account that owns this repository, and `<profile>` with the DSH profile to modify (for example `desktop`).

## Use

Open **Settings → Wallpaper** (背景图片):

1. Upload an image.
2. Pick a fill mode.
3. Choose the **Shade effect**: **Soft** for a wash, or **No mask** for clear artwork.
4. Adjust text color if needed.
5. Close Settings; the wallpaper applies to the workspace and startup screen.

## Notes

- The image is stored in `localStorage` for the current browser origin. If DSH starts on a different port, the browser treats it as a different origin and the image needs to be uploaded again.
- Text color is applied through the theme's label tokens, so it follows the whole interface. White text is usually best with **No mask** over a dark image.
- Tested with DeepSeek Harness `0.2.1-rc.5` Web UI.

## License

MIT
