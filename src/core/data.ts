import * as Stats from '@server/statistics/statistics';
import * as WebLog from '@server/web/log';
import { TrialMeta, TrialMetaExt } from '@server/web/meta';
import * as GazeEvent from '@server/tobii/gaze-event';

const cache: any = {};

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

function put( path: string ): Promise<any> {
  return request( 'PUT', path );
}

function get( path: string ): Promise<any> {
  return request( 'GET', path );
}

function getCachedTrial( id: string, path: string ): Promise<any> {
  if (cache[ id ] && cache[ id ][ path ]) {
    return Promise.resolve( cache[ id ][ path ] );
  }
  else {
    return get( `trial/${id}/${path}` ).then( data => {
      if (!cache[ id ]) {
        cache[ id ] = {};
      }
      cache[ id ][ path ] = data;
      return Promise.resolve( data );
    });
  }
}

export function load( name: string ): Promise<Error> {
  return put( `test/${name}` );
}

export function tests(): Promise<string[]> {
  return get( 'tests' );
}

export function trials(): Promise<TrialMeta[]> {
  return get( 'trials' );
}

export function meta( id: string ): Promise<TrialMetaExt> {
  return getCachedTrial( id, 'meta' );
}

export function hits( id: string ): Promise<number[] | WebLog.WrongAndCorrect[]> {
  return getCachedTrial( id, 'hits' );
}

export function marksCorrect( id: string ): Promise<number[]> {
  return getCachedTrial( id, 'marks' );
}

export function marksWrong( id: string ): Promise<number[]> {
  return getCachedTrial( id, 'errors' );
}

export function targets( id: string ): Promise<WebLog.Clickable[]> {
  return getCachedTrial( id, 'targets' );
}

export function events( id: string ): Promise<WebLog.TestEvent[]> {
  return getCachedTrial( id, 'events' );
}

export function fixations( id: string ): Promise<GazeEvent.Fixation[]> {
  return getCachedTrial( id, 'gaze/fixations' );
}

export function saccades( id: string ): Promise<GazeEvent.Fixation[]> {
  return getCachedTrial( id, 'gaze/saccades' );
}

export function stats( id: string ): Promise<Stats.All> {
  return getCachedTrial( id, 'stats' );
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
