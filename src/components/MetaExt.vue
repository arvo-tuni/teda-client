<template lang="pug">
  #meta
    template(v-if="properties")
      .property {{ properties.participantCode }} completing "{{ properties.type }}"

      .property Started at {{ formatDate( properties.startTime ) }}, ended at {{ formatDate( properties.endTime ) }} (duration is {{ toTime( properties.duration ) }})

      .property Window: {{ properties.windowWidth }} x {{ properties.windowHeight }} (document height is {{ properties.windowHeight }})
      .property Area: {{ formatArea( properties.contentArea ) }}

      .property 
        h5.title.is-5 Settings: 
        div Duration: {{ properties.settings.duration }} seconds
        div Content width: {{ properties.settings.contentWidth }}
        div Content left {{ properties.settings.contentLeft }}
        div Font: {{ properties.settings.fontSize }} pt

        div Word spacing: {{ properties.settings.wordSpacing }}
        div Text color: {{ properties.settings.foreground }}
        div Page color: {{ properties.settings.background }}
        div Cursor: {{ properties.settings.cursor }}
        div Letter spacing: {{ properties.settings.letterSpacing }}
        div Line height: {{ properties.settings.lineHeight }}

      .property Instruction: {{ properties.instruction }}

      .property 
        h5.title.is-5 Summary: 
        div marked total: {{ properties.marks }}
          div marked incorrectly: {{ properties.marksWrong }}
        div missed: {{ properties.misses }}
        div scrolls: {{ properties.scrolls }}
        div scrolled to: {{ properties.maxScroll }}

      .property(v-if="properties.headTotals") 
        h5.title.is-5 Head observations
        div Roll: {{ formarHeadData( properties.headTotals.roll ) }};
        div Pitch: {{ formarHeadData( properties.headTotals.pitch ) }};
        div Heading: {{ formarHeadData( properties.headTotals.heading ) }};
        div Movement: {{ formarHeadData( properties.headTotals.movement ) }};

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)

</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import * as WebLog from '../../../test-data-server/js/web/log.js';
import { twoDigits, treeDigits, msToTime, toDate} from '@/core/format';

interface Data {
  properties: Defs.TrialMetaExt | null;
  errorMessage: string;
}

export default Vue.extend({
  name: 'metaExt',
  
  components: {
    Waiting,
    Message,
  },

  data() {
    const r: Data = {
      properties: null,
      errorMessage: ''
    };
    return r;
  },

  props: {
    trial: {
      type: String,
      required: true,
    },
  },

  methods: {
    toTime( duration: number ): string {
      return msToTime( duration );
    },

    formatDate( value: string ): string {
      return toDate( value );
    },

    formatArea( area: WebLog.ContentArea ): string {
      return `(${Math.round( area.width )} x ${Math.round( area.height )}) at [${Math.round( area.left )},${Math.round( area.top )}]`;
    },

    formarHeadData( data: WebLog.HeadTotal ): string {
      return `${data.label}: ${Math.round( data.total )} ${data.unit}, ${Math.round( data.perSecond )}/s`;
    },

    loadData() {
      Data.meta( this.trial )
        .then( (metaExt: Defs.TrialMetaExt) => {
          this.properties = metaExt;
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: ' + (error ? error.message : 'unknown error') + '. Close this message to try again';
        });
    },
  },

  created() {
    this.loadData();
    // hitsPerTenth
    // clickables
    // marked
    // events
    // headData
    // markedWrong
  },
});

</script>

<style scoped lang="less">
#meta {
  margin: 1em;
}
.property {
  margin: 1em 0;
}
</style>
