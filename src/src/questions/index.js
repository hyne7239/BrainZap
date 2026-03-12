import geography  from "./geography.json";
import science    from "./science.json";
import history    from "./history.json";
import sports     from "./sports.json";
import music      from "./music.json";
import movies     from "./movies.json";
import technology from "./technology.json";
import food       from "./food.json";
import animals    from "./animals.json";
import math       from "./math.json";
import popculture from "./popculture.json";
import literature from "./literature.json";

// Math color changed from dull #607D8B → vibrant #5C6BC0 (Indigo) for prominence
export const CATEGORIES = [
  { id:"geography",  label:"Geography",    emoji:"🌍", color:"#4CAF50", questions:geography  },
  { id:"science",    label:"Science",      emoji:"🔬", color:"#2196F3", questions:science    },
  { id:"history",    label:"History",      emoji:"📜", color:"#FF9800", questions:history    },
  { id:"sports",     label:"Sports",       emoji:"⚽", color:"#F44336", questions:sports     },
  { id:"music",      label:"Music",        emoji:"🎵", color:"#9C27B0", questions:music      },
  { id:"movies",     label:"Movies & TV",  emoji:"🎬", color:"#E91E63", questions:movies     },
  { id:"technology", label:"Technology",   emoji:"💻", color:"#00BCD4", questions:technology },
  { id:"food",       label:"Food & Drink", emoji:"🍕", color:"#FF5722", questions:food       },
  { id:"animals",    label:"Animals",      emoji:"🦁", color:"#8BC34A", questions:animals    },
  { id:"math",       label:"Math",         emoji:"➗", color:"#5C6BC0", questions:math       },
  { id:"popculture", label:"Pop Culture",  emoji:"🌟", color:"#FFC107", questions:popculture },
  { id:"literature", label:"Literature",   emoji:"📚", color:"#795548", questions:literature },
];

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function distributeEvenly(categoryIds,count,difficulty){
  const cats=CATEGORIES.filter(c=>categoryIds.includes(c.id));
  if(!cats.length) throw new Error("No valid categories selected");
  const pools=cats.map(c=>({
    questions:shuffle(c.questions.filter(q=>difficulty==="mixed"||q.difficulty===difficulty))
      .map(q=>({...q,categoryId:c.id,categoryEmoji:c.emoji,categoryLabel:c.label}))
  })).filter(p=>p.questions.length>0);
  if(!pools.length) throw new Error(`No questions available for difficulty: ${difficulty}`);
  const result=[];
  const ptrs=pools.map(()=>0);
  let i=0;
  while(result.length<count){
    const pi=i%pools.length;
    if(ptrs[pi]<pools[pi].questions.length){result.push(pools[pi].questions[ptrs[pi]]);ptrs[pi]++;}
    i++;
    if(i>count*pools.length+pools.length) break;
  }
  return shuffle(result).slice(0,count);
}

export function selectQuestions(categoryIds,count,difficulty){
  const selected=distributeEvenly(categoryIds,count,difficulty);
  return selected.map(q=>{
    const ct=q.options[q.correct];
    const so=shuffle(q.options);
    return{...q,options:so,correct:so.indexOf(ct),answeredCorrectly:false};
  });
}

export function bankStats(){
  const all=CATEGORIES.flatMap(c=>c.questions);
  return{
    total:all.length,
    easy:all.filter(q=>q.difficulty==="easy").length,
    medium:all.filter(q=>q.difficulty==="medium").length,
    hard:all.filter(q=>q.difficulty==="hard").length,
    categories:CATEGORIES.length,
    perCategory:CATEGORIES.map(c=>({id:c.id,label:c.label,emoji:c.emoji,color:c.color,count:c.questions.length})),
  };
}
