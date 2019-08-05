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

export class RequestResult {
  message: string;

  constructor( msg: string ) {
    this.message = msg;
  }
}

function request( method: string, path: string ) {
  return fetch( `http://localhost:3000/${path}`, {
    method,
    mode: 'cors',
    credentials: 'same-origin',
  })
  .then( res => {
    if (res.status === 200) {
      return res.json();
    }
    else {
      return Promise.reject( new RequestResult( `Request error for "${path}": ${res.statusText}` ) );
    }
  });
}

function get( path: string ) {
  return request( 'GET', path );
}

function put( path: string ) {
  return request( 'PUT', path );
}

export function load( name: string ) {
  return put( `test/${name}` );
}

export function tests() {
  return get( 'tests' );
}

export function trials() {
  return get( 'trials' );
}

/*
'/trial/:id': 'full trial data (WARNING! it may take tens of Mb to load)',
'/trial/:id/meta': 'the trial extended meta data',
'/trial/:id/hits': 'the trial selections per decimale',
'/trial/:id/targets': 'the trial targets',
'/trial/:id/marks': 'the trial marked targets',
'/trial/:id/errors': 'the trial erroneously marked targets',
'/trial/:id/events': 'the trial mouse click and scrolls',
'/trial/:id/head': 'the trial head data (WARNING! it may take tens of Mb to load)',
'/trial/:id/gaze': 'the trial Tobii recording meta data (WARNING! it may take tens of Mb to load)',
'/trial/:id/gaze/stimuli': 'the trial gaze stimuli',
'/trial/:id/gaze/events': 'the trial mouse and keyboards events',
'/trial/:id/gaze/samples': 'the trial gaze samples',
'/trial/:id/gaze/fixations': 'the trial fixations',
'/trial/:id/gaze/saccades': 'the trial saccades',
'/trial/:id/gaze/gazeAways': 'the trial gazeAways',

*/
