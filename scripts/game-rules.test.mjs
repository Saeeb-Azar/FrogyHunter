import test from 'node:test'
import assert from 'node:assert/strict'
import { createRun, mergeRun, scoreRun, validateMarkers, formatTime } from '../src/lib/gameRules.ts'
import { findMarkerAtClick } from '../src/lib/hitTest.ts'
import { parseBerlinInput, berlinInput } from '../src/lib/levelValidation.ts'

test('hit areas retain position and round radius across portrait, landscape and zoom', () => {
  const frog = { id: 'f', x: .2, y: .7, radius: .04 }
  for (const [width, height] of [[320,480],[960,1440],[1200,800]]) {
    const rect = { left: 33, top: 71, width, height }
    assert.equal(findMarkerAtClick(33 + width * .2, 71 + height * .7, rect, [frog], new Set())?.id, 'f')
    assert.equal(findMarkerAtClick(33 + width * .2 + width * .05, 71 + height * .7, rect, [frog], new Set()), null)
    assert.equal(findMarkerAtClick(33 + width * .2, 71 + height * .7, rect, [frog], new Set(['f'])), null)
  }
})
test('unfound overlapping marker remains selectable', () => {
  const markers = [{ id:'a', x:.5,y:.5,radius:.1 }, { id:'b',x:.52,y:.5,radius:.08 }]
  assert.equal(findMarkerAtClick(52,50,{left:0,top:0,width:100,height:100},markers,new Set(['a']))?.id,'b')
})
test('replay preserves history, best time and one-time XP', () => {
  const first = { ...createRun(), completed:true, durationMs:20000, clicks:5, foundFroggys:['1','2','3','4','5'] }
  const saved = mergeRun(null,'u','l',first,100)
  assert.equal(saved.xp,scoreRun(first))
  assert.deepEqual(mergeRun(saved,'u','l',first),saved)
  const replay = { ...createRun(), durationMs:3000 }
  const active = mergeRun(saved,'u','l',replay)
  assert.equal(active.completed,true)
  assert.equal(active.completedAt,100)
  const finished = mergeRun(active,'u','l',{...replay,completed:true,durationMs:12000,clicks:5,foundFroggys:first.foundFroggys})
  assert.equal(finished.bestDurationMs,12000)
  assert.equal(finished.xp,saved.xp)
  assert.equal(finished.attempts,2)
})
test('invalid marker data cannot pass publication validation', () => {
  assert.equal(validateMarkers([]),false)
  assert.equal(validateMarkers([{id:'a',x:NaN,y:.2,radius:.03}]),false)
  assert.equal(validateMarkers([{id:'a',x:.1,y:.2,radius:.03},{id:'a',x:.5,y:.2,radius:.03}]),false)
  assert.equal(validateMarkers([{id:'a',x:.1,y:.2,radius:.03}]),true)
})
test('Berlin publication time round-trips in summer and winter', () => {
  for(const input of ['2026-09-09T18:00','2026-12-09T18:00']) assert.equal(berlinInput(parseBerlinInput(input)),input)
  assert.throws(()=>parseBerlinInput('nonsense'))
  assert.equal(formatTime(83000),'01:23')
})
