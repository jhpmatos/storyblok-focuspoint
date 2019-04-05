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
          >
            Upload image and set focus
          </button>
          <div class="uk-margin-small-bottom uk-margin-top">
            <p v-if="!model.image">
              No image selected, please upload an image first.
            </p>
            <template v-else
              >Preview:
              <div class="image__container">
                <img :src="imagePreview" @load="onPreviewLoaded" />
                <span
                  :style="
                    `top:${model.focusPoint.y}%;left:${model.focusPoint.x}%;`
                  "
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
          <button
            class="uk-button uk-button-primary"
            type="button"
            @click="closeModal"
          >
            <i class="uk-icon-check"></i> Done
          </button>
        </div>
      </div>
      <section class="modal__content">
        <p v-if="!model.image">
          No image selected, please upload an image first.
        </p>
        <template v-else>
          <div class="focus-picker">
            <img
              :src="model.image"
              @click="setCoordinates"
              @load="onImageLoaded"
            />
            <span
              :style="`top:${model.focusPoint.y}%;left:${model.focusPoint.x}%;`"
              class="focus-picker__marker"
            />
          </div>
          <div class="uk-flex tree__form-group">
            <div>
              <label class="form__topic">
                X %
                <input
                  v-model="model.focusPoint.x"
                  class="uk-form-small uk-form-width-small"
                />
              </label>
            </div>

            <div class="uk-margin-left">
              <label class="form__topic">
                Y %
                <input
                  v-model="model.focusPoint.y"
                  class="uk-form-small uk-form-width-small"
                />
              </label>
            </div>

            <div class="uk-margin-auto-left">
              <label class="form__topic">
                <button
                  class="uk-button uk-button-secondary"
                  type="button"
                  @click="centerFocus"
                >
                  Center
                </button>
              </label>
            </div>
          </div>
        </template>

        <div class="uk-flex">
          <div style="flex: 1;margin-right: 16px">
            <sb-asset-selector :uid="uid" field="image"></sb-asset-selector>
          </div>
          <div style="flex: 1">
            <button
              style="width: 100%"
              @click="openBynderGallery"
              class="uk-button uk-button-secondary"
              type="button"
              v-if="this.options.oauthToken"
            >
              Open bynder gallery
            </button>
            <div style="min-height: 500px" v-show="showBynderGallery">
              <div
                id="bynder-compactview"
                data-assetTypes="image"
                data-fullScreen="true"
                data-mode="single"
                data-autoload="true"
                :data-defaultEnvironment="this.options.bynderDefaultEnv"
              ></div>
            </div>
          </div>
        </div>
      </section>
      <div v-if="isLoading" class="loading__overlay">
        <div class="loading__spinner"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mixins: [window.Storyblok.plugin],
  data() {
    return {
      modalIsOpen: false,
      imagePreview: "",
      isLoading: false,
      showBynderGallery: false
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

      this.$sb.getScript(
        "https://d8ejoa1fys2rk.cloudfront.net/modules/compactview/includes/js/client-1.4.0.min.js",
        () => {
          document.addEventListener("BynderAddMedia", media => {
            if (media.detail.length === 1) {
              const assetToImport = media.detail[0];

              const urlToImport =
                this.options.hasOwnProperty("bynderDerivative") &&
                this.options.bynderDerivative !== ""
                  ? assetToImport.thumbnails[this.options.bynderDerivative]
                  : assetToImport.thumbnails.webimage;

              this.showBynderGallery = false;

              if (urlToImport !== undefined) {
                const fileExtension = urlToImport.split(".").pop();

                this.isLoading = true;

                fetch(urlToImport)
                  .then(res => res.blob()) // Gets the response and returns it as a blob
                  .then(blob => {
                    this.storyblokImageUpload(
                      blob,
                      `${assetToImport.name}.${fileExtension}`,
                      image => {
                        this.model.image = image.location;
                      },
                      error => {
                        // eslint-disable-next-line
                        console.log(error);
                      }
                    );
                  })
                  .catch(() => {
                    this.isLoading = false;
                  });
              }
            }
          });
        }
      );
    },
    storyblokImageUpload(fileblob, filename, success, failure) {
      this.api.client
        .post(
          `/spaces/${this.spaceId}/assets`,
          { filename: filename },
          {
            headers: {
              Authorization: this.options.oauthToken
            }
          } // uses the option with the name `oauthToken` which needs to be configured in the schema definition of the field you're using the plugin in.
        )
        .then(response => {
          let request = new XMLHttpRequest();
          request.withCredentials = false;
          request.open("POST", response.data.post_url);

          request.onreadystatechange = () => {
            const allowedStatuses = [200, 201, 204];

            if (request.readyState === 4) {
              if (allowedStatuses.includes(request.status)) {
                // eslint-disable-next-line
                console.log("Image uploaded: " + response.data.pretty_url);
                success({ location: response.data.pretty_url });
              } else {
                failure(
                  new Error(
                    `Error during upload with status: ${request.status}`
                  )
                );
              }
            }
          };

          let formData = new FormData();
          for (let key in response.data.fields) {
            formData.append(key, response.data.fields[key]);
          }
          formData.append("file", fileblob);
          request.send(formData);
        })
        .catch(error => {
          failure(error);
        });
    },
    openBynderGallery() {
      this.showBynderGallery = true;
    },
    getPreviewUrl() {
      return this.model.image !== undefined
        ? this.model.image.replace(
            "//a.storyblok.com",
            "//img2.storyblok.com/400x0"
          )
        : "";
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
        this.isLoading = false;
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

.loading__overlay {
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.loading__spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
  }
}
@-webkit-keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
  }
}
</style>
