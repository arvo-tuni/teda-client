/*export class TestMeta {
  
  _id: string;
  participant: string;
  timestamp: Date;
  resultWord: string;

  constructor() {
    this._id = '';
    this.participant = ''; 
    this.timestamp = new Date();
    this.resultWord = '';
  }
}*/
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
