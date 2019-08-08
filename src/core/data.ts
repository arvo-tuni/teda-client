import * as Defs from '@/core/decl';
import * as WebLog from '../../../test-data-server/js/web/log';
import * as GazeEvent from '../../../test-data-server/js/tobii/gaze-event';

function request( method: string, path: string ): Promise<any> {
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
      return Promise.reject( new Error( `Request error for "${path}": ${res.statusText}` ) );
    }
  });
}

function get( path: string ): Promise<any> {
  return request( 'GET', path );
}

function put( path: string ): Promise<any> {
  return request( 'PUT', path );
}

export function load( name: string ): Promise<Error> {
  return put( `test/${name}` );
}

export function tests(): Promise<string[]> {
  return get( 'tests' );
}

export function trials(): Promise<Defs.TrialMeta[]> {
  return get( 'trials' );
}

export function meta( id: string ): Promise<Defs.TrialMetaExt> {
  return get( `trial/${id}/meta` );
}

export function hits( id: string ): Promise<number[] | WebLog.WrongAndCorrect[]> {
  return get( `trial/${id}/hits` );
}

export function marksCorrect( id: string ): Promise<number[]> {
  return get( `trial/${id}/marks` );
}

export function marksWrong( id: string ): Promise<number[]> {
  return get( `trial/${id}/errors` );
}

export function targets( id: string ): Promise<WebLog.Clickable[]> {
  return get( `trial/${id}/targets` );
}

export function events( id: string ): Promise<WebLog.TestEvent[]> {
  return get( `trial/${id}/events` );
}

export function fixations( id: string ): Promise<GazeEvent.Fixation[]> {
  return get( `trial/${id}/gaze/fixations` );
}

export function saccades( id: string ): Promise<GazeEvent.Fixation[]> {
  return get( `trial/${id}/gaze/saccades` );
}

/*
'/trial/:id': 'full trial data (WARNING! it may take tens of Mb to load)',
'/trial/:id/head': 'the trial head data (WARNING! it may take tens of Mb to load)',
'/trial/:id/gaze': 'the trial Tobii recording meta data (WARNING! it may take tens of Mb to load)',
'/trial/:id/gaze/stimuli': 'the trial gaze stimuli',
'/trial/:id/gaze/events': 'the trial mouse and keyboards events',
'/trial/:id/gaze/samples': 'the trial gaze samples',
'/trial/:id/gaze/saccades': 'the trial saccades',
'/trial/:id/gaze/gazeAways': 'the trial gazeAways',

*/
