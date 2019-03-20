<template>
  <div>
    <!-- This is a button toggling the modal -->
    <div v-show="!modalIsOpen">
      <div class="tree__form-group">
        <div class="blok__comp-detail uk-margin-small-bottom">
          <button
            @click="openModal"
            type="button"
            class="uk-form-file uk-button uk-button-small uk-button-primary"
          >Upload image and set focus</button>
          <div class="uk-margin-small-bottom uk-margin-top">
            <p v-if="!model.image">No image selected, please upload an image first.</p>
            <template v-else>Preview:
              <div class="image__container">
                <img :src="imagePreview" @load="onPreviewLoaded">
                <span
                  :style="`top:${model.focusPoint.y}%;left:${model.focusPoint.x}%;`"
                  class="focus-picker__marker"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- This is the modal -->
    <div v-show="modalIsOpen">
      <div class="top-bar">
        <div>
          <button class="uk-button uk-button-primary" type="button" @click="closeModal">
            <i class="uk-icon-check"></i> Done
          </button>
        </div>
      </div>
      <section class="modal__content">
        <p v-if="!model.image">No image selected, please upload an image first.</p>
        <template v-else>
          <div class="focus-picker">
            <img :src="model.image" @click="setCoordinates" @load="onImageLoaded">
            <span
              :style="`top:${model.focusPoint.y}%;left:${model.focusPoint.x}%;`"
              class="focus-picker__marker"
            />
          </div>
          <div class="uk-flex tree__form-group">
            <div>
              <label class="form__topic">
                X %
                <input v-model="model.focusPoint.x" class="uk-form-small uk-form-width-small">
              </label>
            </div>

            <div class="uk-margin-left">
              <label class="form__topic">
                Y %
                <input v-model="model.focusPoint.y" class="uk-form-small uk-form-width-small">
              </label>
            </div>

            <div class="uk-margin-auto-left">
              <label class="form__topic">
                <button
                  class="uk-button uk-button-secondary"
                  type="button"
                  @click="centerFocus"
                >Center</button>
              </label>
            </div>
          </div>
        </template>

        <div class="uk-form-row">
          <sb-asset-selector :uid="uid" field="image"></sb-asset-selector>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  mixins: [window.Storyblok.plugin],
  data() {
    return {
      modalIsOpen: false,
      imagePreview: ""
    };
  },
  methods: {
    initWith() {
      return {
        // needs to be equal to your storyblok plugin name
        plugin: "focus-point",
        image: "",
        imageSize: {
          width: 0,
          height: 0
        },
        focusPoint: {
          // in percentages
          x: 50,
          y: 50
        }
      };
    },
    pluginCreated() {
      if (this.model.image !== "") {
        this.imagePreview = this.getPreviewUrl();
      }
      // eslint-disable-next-line
      console.log("plugin:created");
    },
    getPreviewUrl() {
      return this.model.image.replace(
        "//a.storyblok.com",
        "//img2.storyblok.com/400x0"
      );
    },
    setCoordinates(e) {
      const { height, width } = e.target;

      this.model.focusPoint = {
        x: parseFloat((e.offsetX / (width / 100)).toFixed(2)),
        y: parseFloat((e.offsetY / (height / 100)).toFixed(2))
      };
    },
    onPreviewLoaded() {
      // this is to force dispatching empty resize event, which recalculates iframe height
      window.dispatchEvent(new Event("resize"));
    },
    onImageLoaded(img) {
      // after loading the image refresh model values to force storyblok to refresh iframe height
      const width = img.target.naturalWidth;
      const height = img.target.naturalHeight;

      // this is to force dispatching empty resize event, which recalculates iframe height
      window.dispatchEvent(new Event("resize"));

      this.$nextTick(() => {
        this.imagePreview = this.getPreviewUrl();
        this.model.imageSize = {
          width: width,
          height: height
        };
      });
    },
    openModal() {
      this.$emit("toggle-modal", true);
      this.modalIsOpen = true;
    },
    closeModal() {
      this.$emit("toggle-modal", false);
      this.modalIsOpen = false;
    },
    centerFocus() {
      this.model.focusPoint = {
        x: 50,
        y: 50
      };
    }
  },
  watch: {
    model: {
      handler: function(value) {
        this.$emit("changed-model", value);
      },
      deep: true
    }
  }
};
</script>

<style>
.blok__comp-detail {
  padding: 10px;
  border: 1px solid #d4d4d4;
  border-radius: 3px;
}
.blok__comp-detail p:last-child {
  margin-bottom: 0;
}

.top-bar {
  margin-bottom: 16px;
  text-align: right;
}

.modal__content {
  margin: auto;
  max-width: 800px;
}

.focus-picker {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.focus-picker__marker {
  position: absolute;
  margin-top: -8px;
  margin-left: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
}
.uk-margin-auto-left {
  margin-left: auto;
}

.image__container {
  position: relative;
}
</style>
