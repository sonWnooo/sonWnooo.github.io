import {BlueLeafQuest} from './blue-leaf-logic.js';
export function createBlueLeafGame({THREE:T,scene,camera,leafGeometry,getButterfly,onReset}){
 const ui=document.createElement('div');ui.id='blue-leaf-game';ui.innerHTML=`<style>
 #blue-leaf-game{position:fixed;right:28px;top:24px;z-index:12;display:flex;gap:24px;pointer-events:none;color:#fff;font:16px/1.7 'Microsoft YaHei',sans-serif;letter-spacing:0;font-variant-numeric:tabular-nums;text-shadow:0 1px 2px #1a314e80}
 #blue-leaf-game span{font:inherit;white-space:nowrap}
 </style><span id="ground-counter" aria-label="地面蓝叶"><span id="ground-count">0</span>/6</span><span id="sky-counter" aria-label="空中蓝叶"><span id="sky-count">0</span>/3</span>`;ui.setAttribute('role','status');ui.setAttribute('aria-live','polite');document.body.append(ui);
 const $=s=>ui.querySelector(s);let state,leaves=[],paused=false,finished=false,lastStatus='';
 const placements=[[-3.6,1.9],[-1.5,3.9],[1.4,3.2],[3.7,.8],[2.5,-2.4],[-3,-2.2],[-4,-.5],[.6,2],[3.5,-1.2]];
 const worldVector=new T.Vector3(),butterflyVector=new T.Vector3();
 function sync(){
  const status=JSON.stringify({ground:state.ground,sky:state.sky,spawned:state.spawned,complete:state.done,paused});if(status===lastStatus)return;lastStatus=status;
  $('#ground-count').textContent=state.ground;$('#sky-count').textContent=state.sky;
  $('#ground-counter').setAttribute('aria-label',`地面蓝叶 ${state.ground}/6`);$('#sky-counter').setAttribute('aria-label',`空中蓝叶 ${state.sky}/3`);
  document.documentElement.dataset.blueLeafQuest=status;
 }
 function reset(){for(const l of leaves){scene.remove(l.mesh);l.mesh.geometry.dispose();l.mesh.material.dispose();}leaves=[];state=new BlueLeafQuest();paused=false;finished=false;
  for(let i=0;i<9;i++){const mesh=new T.Mesh(leafGeometry.clone(),new T.MeshBasicMaterial({color:i<6?'#277fce':'#559ff0',side:T.DoubleSide}));mesh.name='BLUE_MAPLE_'+String(i+1).padStart(3,'0');mesh.scale.setScalar(i<6?.44:.52);mesh.rotation.y=i*1.67;mesh.position.set(placements[i][0],i<6?.095:7,placements[i][1]);mesh.visible=i<6;mesh.renderOrder=4;scene.add(mesh);leaves.push({mesh,id:i,fromSky:i>=6});}onReset?.();sync();
 }
 const visibility=()=>{paused=document.hidden;sync();};document.addEventListener('visibilitychange',visibility);
 function update(dt,hasInput){
  if(paused||finished)return;state.update(dt);
  sync();
  camera.updateMatrixWorld(true);const butterfly=getButterfly();butterflyVector.copy(butterfly.position).project(camera);
  for(const leaf of leaves){if(state.collected.has(leaf.id))continue;
    if(leaf.fromSky){const age=state.time-state.spawnTimes[leaf.id-6];leaf.mesh.visible=age>=0;if(age<0)continue;const p=placements[leaf.id],u=Math.min(1,age/6);leaf.mesh.position.set(p[0]+Math.sin(age*1.8+leaf.id)*.65*(1-u),.095+6.9*(1-u),p[1]+Math.sin(age*.9)*.4*(1-u));leaf.mesh.rotation.x=Math.sin(age*2)*.4*(1-u);leaf.mesh.rotation.z=Math.cos(age*1.5)*.35*(1-u);leaf.mesh.rotation.y=leaf.id*1.67+Math.sin(age)*.6*(1-u);}
    leaf.mesh.updateMatrixWorld(true);worldVector.copy(leaf.mesh.position).project(camera);
    const distance=Math.hypot((worldVector.x-butterflyVector.x)*innerWidth/2,(worldVector.y-butterflyVector.y)*innerHeight/2);
    if(hasInput&&worldVector.z>-1&&worldVector.z<1&&Math.abs(worldVector.x)<1.02&&Math.abs(worldVector.y)<1.02&&distance<Math.max(17,Math.min(innerWidth,innerHeight)*.025)){
      if(state.touch(leaf.id)){leaf.mesh.visible=false;sync();}
    }
  }
  if(state.done){finished=true;sync();if(window.parent!==window)window.parent.postMessage({type:'ONE_SECOND_BLUE_LEAF_COMPLETE'},location.origin);}

 }
 const exit=e=>{if(e.code==='Escape'&&window.parent!==window)window.parent.postMessage({type:'ONE_SECOND_BLUE_LEAF_EXIT'},location.origin);};addEventListener('keydown',exit);
 reset();return {update,get paused(){return paused;},get finished(){return finished;},reset,dispose(){removeEventListener('keydown',exit);document.removeEventListener('visibilitychange',visibility);ui.remove();}};
}
