<template lang="pug">
  #list
    .dropdown(:class="{ 'is-active': isListShown }")
      .dropdown-trigger(@click.stop="")
        button.button(aria-haspopup="true" aria-controls="dropdown-menu" @click="toggleList()")
          span {{ item }}
          span.icon.is-small
            i.fas.fa-angle-down(aria-hidden="true")
      .dropdown-menu(role="menu")
        .dropdown-content
          a.dropdown-item(
            v-for="item in items" 
            href="#"
            :class="{ 'is-active': isSelected( item ) }"
            @click.stop="select( item )"
          ) {{ item }}
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
  selectedItem: string;
  isListShown: boolean;
}

/// Emits:
///   selected( item ) 

export default Vue.extend({
  name: 'list',

  props: {
    prompt: {
      type: String,
      default: 'Select an item',
      required: false,
    },

    items: {
      type: Array,
      required: true,
    },

    selected: {
      type: String,
      default: '',
      required: false,
    },
  },

  data() {
    const r: Data = {
      selectedItem: this.selected,
      isListShown: false,
    };
    return r;
  },

  computed: {
    item(): string {
      return this.selectedItem ? this.selectedItem : this.prompt;
    },
  },

  methods: {
    select( item: string ) {
      this.hideList();
      this.selectedItem = item;

      this.$emit( 'selected', this.selectedItem );
    },

    toggleList() {
      this.isListShown = !this.isListShown;
    },

    hideList() {
      this.isListShown = false;
    },

    isSelected( item: string ): boolean {
      return this.selectedItem === item;
    },
  },

  created() {
    window.document.addEventListener( 'click', _ => this.hideList() );
  },

  destroyed() {
    window.document.removeEventListener( 'click', _ => this.hideList() );
  },
});
</script>

<style scoped lang="less">
.dropdown-trigger {
  .button {
    width: 20em;
  }
}
.dropdown-menu {
  width: 20em;
}
</style>
