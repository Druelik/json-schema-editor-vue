<template>
  <div class="json-schema-editor">
    <div
      :style="{
        
        backgroundColor: `rgb(${color + deep * 0}, ${color + deep * 8}, ${
          color + deep * 16
        })`,
      }"
    >
      <b-row align-v="center">
        <b-col  md="1">
          <div class="float-md-center">
          <gl-button
            v-if="pickValue.type === 'object'"
            type="link"
            aria-label="Open/Close"
            @click="hidden = !hidden"
            category="tertiary"
            ><b-icon-chevron-right v-if="hidden" />
            <b-icon-chevron-down v-else />
          </gl-button>
          </div>
        </b-col>

        <b-col md="3">
          <gl-form-input
            :disabled="disabled || root"
            :value="pickKey"
            @blur="onInputName"
            placeholder="Name"
          />
        </b-col>
        <b-col md="2">
          <div class="float-md-left">
            <gl-form-checkbox
              v-if="root"
              :disabled="!isObject && !isArray"
              @change="onRootCheck"
              
            >
              {{ local["checked_all"] }}
            </gl-form-checkbox>
            <gl-form-checkbox
              v-else
              :disabled="isItem"
              :checked="checked"
              @change="onCheck"
            >
              {{ local["required"] }}
            </gl-form-checkbox>
          </div>
        </b-col>
        <b-col md="3">
          <b-form-select
            v-model="pickValue.type"
            :disabled="disabledType"
            @change="onChangeType"
          >
            <b-form-select-option
              v-bind:value="t"
              :key="t"
              v-for="t in TYPE_NAME"
            >
              {{ t }}
            </b-form-select-option>
          </b-form-select>
        </b-col>
        <b-col md="3">
          <div class="float-md-right">
            <gl-button
              v-if="!root && !isItem"
              type="link"
              title="Remove Node"
              @click="removeNode"
              category="tertiary"
              ><b-icon-x scale="1.5"
            /></gl-button>
            <gl-button
              v-if="isObject"
              type="link"
              title="Add new Node"
              class="plus-icon"
              @click="addChild"
              category="tertiary"
              ><b-icon-plus scale="1.5"
            /></gl-button>
            <gl-button
              title="Settings"
              type="link"
              class="setting-icon"
              @click="onSetting"
              category="tertiary"
              ><b-icon-gear-fill scale="1"
            /></gl-button>
          </div>
        </b-col>
      </b-row>
    </div>

    <template v-if="!hidden && pickValue.properties && !isArray">
      <json-schema-editor
        v-for="(item, key, index) in pickValue.properties"
        :value="{ [key]: item }"
        :parent="pickValue"
        :key="index"
        :deep="deep + 1"
        :root="false"
        class="children"
        :lang="lang"
        :custom="custom"
      />
    </template>
    <template v-if="isArray">
      <json-schema-editor
        :value="{ items: pickValue.items }"
        :deep="deep + 1"
        disabled
        isItem
        :root="false"
        class="children"
        :lang="lang"
        :custom="custom"
      />
    </template>
    <gl-modal
      modal-id="adv_settings"
      v-model="modalVisible"
      :title="local['adv_setting']"
      :maskClosable="false"
      :okText="local['ok']"
      :cancelText="local['cancel']"
      size="lg"
      @ok="handleOk"
      dialogClass="json-schema-editor-advanced-modal"
    >
      <!-- <h3 v-text="local['base_setting']"></h3> -->
      <gl-form>
        <b-row>
          <b-col md="4" class="mt-2">
            <span>{{ local["title"] }}</span>
            <gl-form-input
              v-model="pickValue.title"
              :placeholder="local['title']"
            />
          </b-col>
          <b-col
            md="4"
            class="mt-2"
            v-for="(item, key) in advancedValue"
            :key="key"
          >
            <span>{{ local[key] }}</span>
            <gl-form-input
              v-model="advancedValue[key]"
              v-if="advancedAttr[key].type === 'integer'"
              type="number"
              :placeholder="key"
            />
            <gl-form-input
              v-model="advancedValue[key]"
              v-else-if="advancedAttr[key].type === 'number'"
              :placeholder="key"
            />
            <span
              v-else-if="advancedAttr[key].type === 'boolean'"
              style="display: inline-block; width: 100%"
            >
              <gl-toggle v-model="advancedValue[key]" />
            </span>
            <gl-form-select
              v-else-if="advancedAttr[key].type === 'array'"
              v-model="advancedValue[key]"
              :options="advancedAttr[key].enums"
              :getPopupContainer="
                (triggerNode) => {
                  return triggerNode.parentNode || document.body;
                }
              "
              :placeholder="local[key]"
            />

            <gl-form-input
              v-model="advancedValue[key]"
              v-else
              style="width: 100%"
              :placeholder="key"
            />
          </b-col>
        </b-row>
      </gl-form>
      <!-- <h3 v-text="local['add_custom']" v-show="custom"></h3>
      <gl-form>
        <b-row>
          <b-col
            xl="12"
            v-for="item in customProps"
            :key="item.key"
            style="display: flex"
          >
            <label style="align-self: end; width: 100px">{{ item.key }} </label>
            <gl-form-input
              v-model="item.value"
              style="width: calc(100% - 30px)"
            />
            <gl-button
              icon="close"
              type="link"
              @click="customProps.splice(customProps.indexOf(item), 1)"
              style="width: 30px"
              category="tertiary"
            />
          </b-col>
          <b-col
            xl="11"
            v-show="addProp.key != undefined"
            style="display: flex"
          >
            <gl-form-input
              v-if="customing"
              v-model="addProp.key"
              class="w-100 mr-2"
            />
            <gl-form-input v-model="addProp.value" style="width: 100%" />
          </b-col>
          <b-col>
            <gl-button
              icon="check"
              type="link"
              category="tertiary"
              @click="confirmAddCustomNode"
              v-if="customing"
            />
            <gl-button
              icon="plus"
              @click="addCustomNode"
              :title="local['add_custom']"
              :hidden="customing"
              category="tertiary"
            />
          </b-col>
        </b-row>
      </gl-form> -->
      <div class="mt-3">
        <gl-button v-gl-collapse-toggle.collapse-1 category="primary">
          Show preview
        </gl-button>
        <gl-collapse id="collapse-1">
          <h3 v-text="local['preview']"></h3>
          <pre style="width: 100%">{{ completeNodeValue }}</pre>
        </gl-collapse>
      </div>
    </gl-modal>
  </div>
</template>
<script>
import setConfigs from "@gitlab/ui/dist/config";

setConfigs();

import {
  BRow,
  BCol,
  BFormSelect,
  BFormSelectOption,
  VBToggle,
  BIconPlus,
  BIconGearFill,
  BIconX,
  BIconChevronDown,
  BIconChevronRight,
} from "bootstrap-vue";

import { isNull } from "./util";
import { TYPE_NAME, TYPE } from "./type/type";

import {
  GlButton,
  GlForm,
  GlToggle,
  GlFormInput,
  GlFormCheckbox,
  GlModal,
  GlFormSelect,
  GlCollapse,

} from "@gitlab/ui";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import LocalProvider from "./LocalProvider";
export default {
  name: "JsonSchemaEditor",
  directives: {
    "gl-collapse-toggle": VBToggle,
  },
  components: {
    BRow,
    BCol,
    GlButton,
    GlFormInput,
    GlFormCheckbox,
    BFormSelect,
    BFormSelectOption,
    GlModal,
    GlForm,
    GlFormSelect,
    GlCollapse,
    GlToggle,
    BIconPlus,
    BIconGearFill,
    BIconX,
    BIconChevronDown,
    BIconChevronRight,

  },
  props: {
    value: {
      type: Object,
      required: true,
    },
    disabled: {
      //name不可编辑，根节点name不可编辑,数组元素name不可编辑
      type: Boolean,
      default: false,
    },
    disabledType: {
      //禁用类型选择
      type: Boolean,
      default: false,
    },
    isItem: {
      //是否数组元素
      type: Boolean,
      default: false,
    },
    deep: {
      // 节点深度，根节点deep=0
      type: Number,
      default: 0,
    },
    color: {
      type: Number,
      default: 200,
    },
    root: {
      //是否root节点
      type: Boolean,
      default: true,
    },
    parent: {
      //父节点
      type: Object,
      default: null,
    },
    custom: {
      //enable custom properties
      type: Boolean,
      default: false,
    },
    lang: {
      // i18n language
      type: String,
      default: "en_US",
    },
  },
  computed: {
    pickValue() {
      return Object.values(this.value)[0];
    },
    pickKey() {
      return Object.keys(this.value)[0];
    },
    isObject() {
      return this.pickValue.type === "object";
    },
    isArray() {
      return this.pickValue.type === "array";
    },
    checked() {
      return (
        this.parent &&
        this.parent.required &&
        this.parent.required.indexOf(this.pickKey) >= 0
      );
    },
    advanced() {
      return TYPE[this.pickValue.type];
    },
    advancedAttr() {
      return TYPE[this.pickValue.type].attr;
    },
    advancedNotEmptyValue() {
      const jsonNode = Object.assign({}, this.advancedValue);
      for (let key in jsonNode) {
        isNull(jsonNode[key]) && delete jsonNode[key];
      }
      return jsonNode;
    },
    completeNodeValue() {
      const t = {};
      for (const item of this.customProps) {
        t[item.key] = item.value;
      }
      return Object.assign({}, this.pickValue, this.advancedNotEmptyValue, t);
    },
  },
  data() {
    return {
      TYPE_NAME,
      preview: false,
      hidden: false,
      countAdd: 1,
      modalVisible: false,
      advancedValue: {},
      addProp: {}, // 自定义属性
      customProps: [],
      customing: false,
      local: LocalProvider(this.lang),
    };
  },
  methods: {
    onInputName(e) {
      const val = e.target.value;
      const p = {};
      console.log(e.target);
      console.log(this.parent.properties);
      for (let key in this.parent.properties) {
        console.log(key);
        console.log(this.parent.properties[key]);
        if (key != this.pickKey) {
          p[key] = this.parent.properties[key];
        } else {
          p[val] = this.parent.properties[key];
          delete this.parent.properties[key];
        }
      }
      //DOuble things get deleted
      this.$set(this.parent, "properties", p);
      // 删掉无效的required
      const requireds = this.parent.required;
      if (requireds && requireds.length > 0) {
        this.$set(
          this.parent,
          "required",
          requireds.filter((item) => p[item])
        );
      }
    },
    onChangeType() {
      this.$delete(this.pickValue,"maximum");
      this.$delete(this.pickValue, "properties");
      this.$delete(this.pickValue, "items");
      this.$delete(this.pickValue, "required");
      if (this.isArray) {
        this.$set(this.pickValue, "items", { type: "string" });
      }
    },
    onCheck(e) {
      this._checked(e, this.parent);
    },
    onRootCheck(e) {
      this._deepCheck(e, this.pickValue);
    },
    _deepCheck(checked, node) {
      if (node.type === "object" && node.properties) {
        checked
          ? this.$set(node, "required", Object.keys(node.properties))
          : this.$delete(node, "required");
        Object.keys(node.properties).forEach((key) =>
          this._deepCheck(checked, node.properties[key])
        );
      } else if (node.type === "array" && node.items.type === "object") {
        checked
          ? this.$set(
              node.items,
              "required",
              Object.keys(node.items.properties)
            )
          : this.$delete(node.items, "required");
        Object.keys(node.items.properties).forEach((key) =>
          this._deepCheck(checked, node.items.properties[key])
        );
      }
    },
    _checked(checked, parent) {
      let required = parent.required;
      if (checked) {
        required || this.$set(this.parent, "required", []);

        required = this.parent.required;
        required.indexOf(this.pickKey) === -1 && required.push(this.pickKey);
      } else {
        const pos = required.indexOf(this.pickKey);
        pos >= 0 && required.splice(pos, 1);
      }
      required.length === 0 && this.$delete(parent, "required");
    },
    addChild() {
      const name = this._joinName();
      const type = "text";
      const node = this.pickValue;
      node.properties || this.$set(node, "properties", {});
      const props = node.properties;
      this.$set(props, name, { type: type });
    },
    addCustomNode() {
      this.$set(this.addProp, "key", this._joinName());
      this.$set(this.addProp, "value", "");
      this.customing = true;
    },
    confirmAddCustomNode() {
      this.customProps.push(this.addProp);
      this.addProp = {};
      this.customing = false;
    },
    removeNode() {
      const { properties, required } = this.parent;
      this.$delete(properties, this.pickKey);
      if (required) {
        const pos = required.indexOf(this.pickKey);
        pos >= 0 && required.splice(pos, 1);
        required.length === 0 && this.$delete(this.parent, "required");
      }
    },
    _joinName() {
      return `field_${this.deep}_${this.countAdd++}`;
    },
    onSetting() {
      this.modalVisible = true;
      this.advancedValue = this.advanced.value;
      for (const k in this.advancedValue) {
        if (this.pickValue[k]) this.advancedValue[k] = this.pickValue[k];
      }
    },

    handleOk() {
      this.modalVisible = false;
      console.log(this);
      for (const key in this.advancedValue) {
        if (isNull(this.advancedValue[key])) {
          this.$delete(this.pickValue, key);
        } else {
          this.$set(this.pickValue, key, this.advancedValue[key]);
        }
      }
      for (const item of this.customProps) {
        this.$set(this.pickValue, item.key, item.value);
      }
    },
  },
};
</script>
<style src="@gitlab/ui/dist/index.css">
</style>
<style src="@gitlab/ui/dist/utility_classes.css">
</style>
<style scoped>
.gl-form-checkbox, .gl-form-radio {
  line-height: 0.85rem;
  margin-top: 8px;
}
</style>