# Storyblok Focus Point plugin

## Installing the plugin in your storyblok space 
To use focus point plugin you need to compile and minify the plugin. Go to `/plugin` folder and do:
#### Compiles and minifies for production
```
npm install
npm run build
```

After running the build you should get a folder `/dist` with an `export.js` file inside. 
Create a new plugin in storyblok and paste the content of `export.js` and publish it.  
The plugin will be available in your storyblok component schemas. 



##### More info on storyblok plugin usage/implementation: 
https://www.storyblok.com/docs/Guides/Creating-a-field-type-plugin

---

## Using the plugin output in your components
The output of the plugin has this structure:
```json
{
  "plugin": "focus-point",
  "image": "//a.storyblok.com/f/51421/1928x1164/d3b11d6d60/testing-resize.jpg",
  "imageSize": {
    "width": 1928,
    "height": 1164
  },
  "focusPoint": {
    "x": 50,
    "y": 50
  },
  "_uid": "be10eb2d-60bd-46ec-abe5-f851d2df29a2"
}
```
* `image` - original image url  
* `imageSize` - original image size (px) 
* `focusPoint` - selected focus point (percentage)


---

## Javascript helper functions
You can use the data retrived from the plugin with our javascript helper functions.  
In the file `/helper/image.js` there's a function `resizeWithFocusPoint(image, originalSize, focusPoint, size, quality)`  

* `image` - original image url  
* `originalSize` - original image size (px) 
* `focusPoint` - focus point (percentage)
* `size` - an object with the desired new size `{width, height}`
* `quality` - image quality (only affects jpgs) - default value: `90`

Returns the generated image url and the size of the new image:
```json
{
  "url": "//img2.storyblok.com/1200x800/filters:focal(699x663:700x664):quality(90)/f/51421/1928x1164/d3b11d6d60/testing-resize.jpg",
  "size": {
    "width": 1200,
    "height": 800
  }
}
```
#### Usage example in react: 

```JSX
import { resizeWithFocusPoint } from '../helpers/image';

//...

const story = Storyblok.get('cdn/stories/home');
const focusPoint = story.content.heroImage;

//...

<img src={resizeWithFocusPoint(focusPoint.image, focusPoint.imageSize, focusPoint.focusPoint, size).url} />
```

### srcSet
There's also a helper that returns an array with srcsets: `resizeWithFocusPointSrcSet(image, originalSize, focusPoint, srcSet, quality)`
The parameters are similar to `resizeWithFocusPoint()` the only difference is the `srcSet`:

* `srcSet`: an array of objects { width, height, srcSetSize }   

#### Usage example in react: 
```JSX
import { resizeWithFocusPointSrcSet } from '../helpers/image';

//...

<img
    src={resizeWithFocusPoint(
      focusPointItem.image,
      focusPointItem.imageSize,
      focusPointItem.focusPoint,
      size
    ).url}
    srcSet={resizeWithFocusPointSrcset(
      focusPointItem.image,
      focusPointItem.imageSize,
      focusPointItem.focusPoint,
      [
        { width: 400, height: 300, srcSetSize: '500w' },
        { width: 1000, height: 0, srcSetSize: '1000w' },
      ]
    )}
/>
```

###### Notes:
Storyblok only allows resizes up to 4000x4000px - in resizing functions we have a const `STORYBLOK_IMAGE_SIZE_LIMIT` that can be updated if/when storyblok changes this value.
You can set `QUALITY_DEFAULT` in helper file.
When the `width` or `height` value is set to `0` the resize is done keeping the original image aspect ratio.

## Bynder support
This plugin supports bynder, in order to use it you need to provide the following options:

* `oauthToken`: storyblok personal access token (you can get one in your storyblok / my account menu)
* `bynderDerivative`: optional - you can pass a specific bynder derivative (image transform) - if none is provided it will use `webimage` by default 
* `bynderDefaultEnv`: optional - set a default environment for the Compact View, e.g.: https://educationfirst.getbynder.com  
