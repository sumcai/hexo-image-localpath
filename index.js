//const isDev = (process.env.npm_lifecycle_script || '').indexOf('hexo generate') === - 1
const isDev = false
const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')

const CDN_PREFIX = (function () {
  const intuitive_image = hexo.config.intuitive_image
  if (!intuitive_image || !intuitive_image.cdn || !intuitive_image.cdn.repo) return
  let prefix = 'https://cdn.jsdelivr.net/gh/'
  prefix += encodeURI(intuitive_image.cdn.repo)
  prefix += intuitive_image.cdn.branch ? `@${encodeURI(intuitive_image.cdn.branch)}` : ''
  prefix += '/'
  return prefix
})();

if (CDN_PREFIX && !isDev) {
  const msg = `Your images will served from cdn: ${CDN_PREFIX}`
  if (hexo.log && hexo.log.i) {
    hexo.log.i(msg)
  } else {
    console.log(msg)
  }
}

const SHOULD_HASH_IMAGE = hexo.config.intuitive_image && hexo.config.intuitive_image.hash

// match markdown image and covert to asset_img 
hexo.extend.filter.register('before_post_render', function (data) {
  const fullSource = data.full_source
  const postPath = data.path
  const publicDir = this.public_dir
  data.content = data.content.replace(/(?<=!\[[^\[\]]*\]\()(\S+)(?=\s?(".*")?\))/g,
    function (match_str, imagePath) {
      if (!shouldProcess(imagePath)) return match_str
      const result = convertPath({
        fullSource,
        postPath,
        imagePath,
        publicDir,
        isDev
      })
      copyImage(result.imageAbsPath, result.imageDest, isDev)
      return result.imageURI
    });

  return data;
});

// ignore http and abs path(starts with /)
function shouldProcess(imgPath) {
  return /^(\.|[^/])/.test(imgPath) && !/\/\//.test(imgPath)
}

// convert
function convertPath({ fullSource, postPath, imagePath, publicDir, isDev }) {
  // in case of encoded string in file path
  const imageAbsPath = decodeURI(path.resolve(path.dirname(fullSource), imagePath))

  if (!fs.existsSync(imageAbsPath)) {
    throw new TypeError(`${imagePath} not exists in post <${fullSource}>`)
  }

  let imageBaseName = ''
  if (isDev || !SHOULD_HASH_IMAGE) {
    imageBaseName = path.basename(imagePath)
  } else {
    imageBaseName = md5File(imageAbsPath) + path.extname(imagePath)
  }

  const urlPrefix = (isDev || !CDN_PREFIX) ? '/' : CDN_PREFIX;
  let imageDest = path.join(postPath.split(path.sep)[0], 'image-assets', imageBaseName)
  const imageURI = encodeURI(urlPrefix + imageDest)
  imageDest = path.join(publicDir, imageDest)
  return {
    imageAbsPath,
    imageDest,
    imageURI
  }
}

/**
 * copy file
 */
async function copyImage(src, dest, isDev) {
  const stat = await checkFile(dest, !isDev)
  // use symbol link instead of copy when dev
  if (isDev) {
    if (stat) return
    await fs.ensureSymlink(src, dest)
  } else {
    if (stat) {
      // exists and not symbol link
      if (!stat.isSymlink) {
        return
      }
      // remove linked file
      await fs.unlink(dest)
    }
    await fs.ensureDir(path.dirname(dest))
    await fs.copyFile(src, dest)
  }
}

/**
 * get md5 of a file
 */
function md5File(filePath) {
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('md5')
  hashSum.update(fileBuffer)
  return hashSum.digest('hex')
}

/**
 * check file, return false if file not exists
 *  return true needSymlink is false, or return { isSymlink: boolean }
 */
async function checkFile(filePath, needSymlink) {
  try {
    const stat = await fs.stat(filePath)
    if (!needSymlink) return true
    return {
      isSymlink: stat.isSymbolicLink()
    }
  } catch (error) {
    return false
  }
}
