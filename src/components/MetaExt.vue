<template lang="pug">
  #meta
    template(v-if="meta")
      section.section
        h3.title.is-3 {{ subject }} completing "{{ meta.type }}"
        .subProperty Started at {{ formatDate( meta.startTime ) }}, ended at {{ formatDate( meta.endTime ) }} (duration is {{ toTime( meta.duration ) }})
        .subProperty Window: {{ meta.windowWidth }} x {{ meta.windowHeight }} (document height is {{ meta.windowHeight }})
        .subProperty(v-if="meta.contentArea") Area: {{ formatArea( meta.contentArea ) }}

      section.section(v-if="meta.settings")
        h5.title.is-5 Settings: 
        .property Duration: {{ meta.settings.duration }} seconds
        .property Content width: {{ meta.settings.contentWidth }}
        .property Content left {{ meta.settings.contentLeft }}
        .property Font: {{ meta.settings.fontSize }} pt
        template(v-if="meta.settings.wordSpacing !== undefined")
          .property Word spacing: {{ meta.settings.wordSpacing }}
          .property Text color: {{ meta.settings.foreground }}
          .property Page color: {{ meta.settings.background }}
          .property Cursor: {{ meta.settings.cursor }}
          .property Letter spacing: {{ meta.settings.letterSpacing }}
          .property Line height: {{ meta.settings.lineHeight }}

      section.section
        h5.title.is-5 Instruction: 
        .property {{ meta.instruction }}

      section.section
        h5.title.is-5 Summary: 
        .property marked total: {{ meta.marks }}
        .property(v-if="meta.marksWrong !== undefined") marked incorrectly: {{ meta.marksWrong }}
        .property missed: {{ meta.misses }}
        .property scrolls: {{ meta.scrolls }}
        .property scrolled to: {{ meta.maxScroll }}

      section.section(v-if="meta.headTotals") 
        h5.title.is-5 Head observations
        .property Roll: {{ formarHeadData( meta.headTotals.roll ) }};
        .property Pitch: {{ formarHeadData( meta.headTotals.pitch ) }};
        .property Heading: {{ formarHeadData( meta.headTotals.heading ) }};
        .property Movement: {{ formarHeadData( meta.headTotals.movement ) }};

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)

</template>

<script lang="ts">
import Vue from 'vue';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Transform from '@/core/transform';
import { secToTime, toDate} from '@/core/format';

import * as WebLog from '@server/web/log';
import { TrialMetaExt } from '@server/web/meta';

interface CompData {
  meta: TrialMetaExt;
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
      meta: new TrialMetaExt(),
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
      return this.meta.participantCode ? this.meta.participantCode : 'Someone';
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
        .then( (meta: TrialMetaExt) => {
          this.meta = Transform.meta( meta );
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
.subProperty {
  font-size: smaller;
}
</style>
