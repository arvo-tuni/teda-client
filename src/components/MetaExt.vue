<template lang="pug">
  #meta
    template(v-if="properties")
      section.section
        h3.title.is-3 {{ subject }} completing "{{ properties.type }}"
        .subProperty Started at {{ formatDate( properties.startTime ) }}, ended at {{ formatDate( properties.endTime ) }} (duration is {{ toTime( properties.duration ) }})
        .subProperty Window: {{ properties.windowWidth }} x {{ properties.windowHeight }} (document height is {{ properties.windowHeight }})
        .subProperty(v-if="properties.contentArea") Area: {{ formatArea( properties.contentArea ) }}

      section.section(v-if="properties.settings")
        h5.title.is-5 Settings: 
        .property Duration: {{ properties.settings.duration }} seconds
        .property Content width: {{ properties.settings.contentWidth }}
        .property Content left {{ properties.settings.contentLeft }}
        .property Font: {{ properties.settings.fontSize }} pt
        template(v-if="properties.settings.wordSpacing !== undefined")
          .property Word spacing: {{ properties.settings.wordSpacing }}
          .property Text color: {{ properties.settings.foreground }}
          .property Page color: {{ properties.settings.background }}
          .property Cursor: {{ properties.settings.cursor }}
          .property Letter spacing: {{ properties.settings.letterSpacing }}
          .property Line height: {{ properties.settings.lineHeight }}

      section.section
        h5.title.is-5 Instruction: 
        .property {{ properties.instruction }}

      section.section
        h5.title.is-5 Summary: 
        .property marked total: {{ properties.marks }}
        .property(v-if="properties.marksWrong !== undefined") marked incorrectly: {{ properties.marksWrong }}
        .property missed: {{ properties.misses }}
        .property scrolls: {{ properties.scrolls }}
        .property scrolled to: {{ properties.maxScroll }}

      section.section(v-if="properties.headTotals") 
        h5.title.is-5 Head observations
        .property Roll: {{ formarHeadData( properties.headTotals.roll ) }};
        .property Pitch: {{ formarHeadData( properties.headTotals.pitch ) }};
        .property Heading: {{ formarHeadData( properties.headTotals.heading ) }};
        .property Movement: {{ formarHeadData( properties.headTotals.movement ) }};

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)

</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import { twoDigits, treeDigits, secToTime, toDate} from '@/core/format';

import * as WebLog from '@server/web/log';

interface CompData {
  properties: Defs.TrialMetaExt;
  errorMessage: string;
}

export default Vue.extend({
  name: 'metaExt',

  components: {
    Waiting,
    Message,
  },

  data() {
    return {
      properties: new Defs.TrialMetaExt(),
      errorMessage: '',
    } as CompData;
  },

  props: {
    trial: {
      type: String,
      required: true,
    },
  },

  computed: {
    subject(): string {
      return this.properties.participantCode ? this.properties.participantCode : 'Someone';
    },
  },

  methods: {
    toTime( duration: number ): string {
      return secToTime( Math.floor( duration / 1000 ) );
    },

    formatDate( value: string ): string {
      return toDate( value );
    },

    formatArea( area: WebLog.ContentArea ): string {
      return `(${Math.round( area.width )} x ${Math.round( area.height )})`
        + ' at '
        + `[${Math.round( area.left )},${Math.round( area.top )}]`;
    },

    formarHeadData( data: WebLog.HeadTotal ): string {
      return `${data.label}: ${Math.round( data.total )} ${data.unit}, ${Math.round( data.perSecond )}/s`;
    },

    loadData() {
      this.errorMessage = '';

      Data.meta( this.trial )
        .then( (metaExt: Defs.TrialMetaExt) => {
          this.properties = metaExt;
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: '
            + (error ? error.message : 'unknown error')
            + '. Close this message to try again';
        });
    },
  },

  created() {
    this.loadData();
  },
});

</script>

<style scoped lang="less">
#meta {
  margin: 1em;

  .section {
    padding: 1.5rem;
  }
}
.property {
}
.subProperty {
  font-size: smaller;
}
</style>
