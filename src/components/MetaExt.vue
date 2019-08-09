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
        div Duration: {{ properties.settings.duration }} seconds
        div Content width: {{ properties.settings.contentWidth }}
        div Content left {{ properties.settings.contentLeft }}
        div Font: {{ properties.settings.fontSize }} pt
        template(v-if="properties.settings.wordSpacing !== undefined")
          div Word spacing: {{ properties.settings.wordSpacing }}
          div Text color: {{ properties.settings.foreground }}
          div Page color: {{ properties.settings.background }}
          div Cursor: {{ properties.settings.cursor }}
          div Letter spacing: {{ properties.settings.letterSpacing }}
          div Line height: {{ properties.settings.lineHeight }}

      section.section
        h5.title.is-5 Instruction: 
        div {{ properties.instruction }}

      section.section
        h5.title.is-5 Summary: 
        div marked total: {{ properties.marks }}
        div(v-if="properties.marksWrong !== undefined") marked incorrectly: {{ properties.marksWrong }}
        div missed: {{ properties.misses }}
        div scrolls: {{ properties.scrolls }}
        div scrolled to: {{ properties.maxScroll }}

      section.section(v-if="properties.headTotals") 
        h5.title.is-5 Head observations
        div Roll: {{ formarHeadData( properties.headTotals.roll ) }};
        div Pitch: {{ formarHeadData( properties.headTotals.pitch ) }};
        div Heading: {{ formarHeadData( properties.headTotals.heading ) }};
        div Movement: {{ formarHeadData( properties.headTotals.movement ) }};

      section.section(v-show="hasHits")
        h5.title.is-5 Hits histogram
        canvas(ref="hits" width="300" height="100")

    message(v-else-if="errorMessage" type="error" :message="errorMessage" @closed="loadData()")

    waiting(v-else is-modal=false is-bar=false)

</template>

<script lang="ts">
import Vue from 'vue';
import Chart from 'chart.js';

import Waiting from '@/components/Waiting.vue';
import Message from '@/components/Message.vue';

import * as Data from '@/core/data';
import * as Defs from '@/core/decl';
import { twoDigits, treeDigits, secToTime, toDate} from '@/core/format';

import * as WebLog from '@server/web/log';

interface CompData {
  properties: Defs.TrialMetaExt;
  hits: any[];
  errorMessage: string;
  chart: any;
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
      hits: [],
      errorMessage: '',
      chart: null,
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

    hasHits(): boolean {
      return this.hits.length > 1;
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
          return Data.hits( this.trial );
        })
        .then( (hits: any[]) => {
          this.hits = hits;
          this.createHitsGraph( this.$refs.hits as HTMLCanvasElement );
        })
        .catch( (error: Error) => {
          this.errorMessage = 'Cannot retrieve data: '
            + (error ? error.message : 'unknown error')
            + '. Close this message to try again';
        });
    },

    createHitsGraph( el: HTMLCanvasElement ) {
      const datasets: Array<{data: number[], label: string, backgroundColor: string}> = [];

      if (this.hits[0].wrong !== undefined) {
        datasets.push({
          label: 'wrong',
          data: this.hits.map( (item: WebLog.WrongAndCorrect) => item.wrong ),
          backgroundColor: 'rgba(255, 0, 0, 0.3)',
        });
        datasets.push({
          label: 'correct',
          data: this.hits.map( (item: WebLog.WrongAndCorrect) => item.correct ),
          backgroundColor: 'rgba(0, 255, 0, 0.3)',
        });
      }
      else {
        datasets.push({
          label: 'total',
          data: this.hits,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        });
      }

      this.chart = new Chart( el, {
        type: 'bar',
        data: {
          labels: datasets[0].data.map( (val: number, index: number) => `${(index + 1) * 10}%` ),
          datasets,
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                max: this.properties.maxHistPerTenth + 2,
              },
            }],
          },
        },
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
  margin: 1em 0;
}
.subProperty {
  font-size: smaller;
}
</style>
