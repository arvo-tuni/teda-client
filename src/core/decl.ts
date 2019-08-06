import * as WebLog from '../../../test-data-server/js/web/log.js';

export class TrialMeta {
  
  _id: string;
  participant: string;
  timestamp: Date;
  type: string;

  constructor() {
    this._id = '';
    this.participant = ''; 
    this.timestamp = new Date();
    this.type = '';
  }
}

export class TrialMetaExt {
  participantCode: string;
  type: string;

  startTime: Date;
  endTime: Date;
  duration: number;

  contentArea: WebLog.ContentArea;
  windowWidth: number;
  windowHeight: number;
  docHeight: number;

  settings: WebLog.Settings;
  instruction: string;

  misses: number;
  marks: number;
  marksWrong: number;
  maxHistPerTenth: number;
  scrolls: number;
  maxScroll: number;
  headTotals: WebLog.HeadTotals;

  constructor() {
    this.contentArea = new WebLog.ContentArea();
    this.windowWidth = 0;
    this.windowHeight = 0;
    this.scrolls = 0;
    this.settings = new WebLog.Settings();
    this.maxHistPerTenth = 0;
    this.misses = 0;
    this.instruction = '';
    this.docHeight = 0;
    this.startTime = new Date();
    this.marks = 0;
    this.duration = 0;
    this.type = '';
    this.endTime = new Date();
    this.maxScroll = 0;
    this.headTotals = new WebLog.HeadTotals();
    this.participantCode = '';
    this.marksWrong = 0;
  }
}

        //this.hitsPerTenth = [ Number, WrongAndCorrect ];     // 10 values
        //this.clickables = [ Clickable ];
        // this.marked: number[];
        // this.markedWrong = [Number];
        // this.lastMarked = Number;
        // this.events = [ 
        //     TestEvent, 
        //     TestEventBuild, 
        //     TestEventClicked, 
        //     TestEventScroll, 
        //     TestEventVeroNav, 
        //     TestEventVeroNavData,
        //     TestEventVeroUI,
        // ]; 
        // this.gazze
        // this.headData = [ HeadData ];
