export class BlueLeafQuest {
 constructor(){this.time=0;this.collected=new Set();this.spawnTimes=[4,12,20];}
 update(dt){if(!this.done)this.time+=Math.max(0,Math.min(dt,.1));}
 available(id){return Number.isInteger(id)&&id>=0&&id<9&&(id<6||this.time>=this.spawnTimes[id-6]);}
 touch(id){if(!this.available(id)||this.collected.has(id))return false;this.collected.add(id);return true;}
 get ground(){return [...this.collected].filter(i=>i<6).length;}
 get sky(){return [...this.collected].filter(i=>i>=6).length;}
 get spawned(){return this.spawnTimes.filter(t=>t<=this.time).length;}
 get done(){return this.collected.size===9;}
}
