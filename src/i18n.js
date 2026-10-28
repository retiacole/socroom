/* Browser preference chooses the initial language; an explicit choice wins. */
(function(root){
  'use strict';
  const KEY='socroom.language.v1';
  const messages=root.SOC_MESSAGES||{};
  function browserLocale(){
    let preferred='';
    try{
      const values=root.navigator?.languages;
      if(Array.isArray(values))preferred=values.find(value=>typeof value==='string'&&value.trim())||'';
    }catch(_){/* Browser language access is optional. */}
    if(!preferred)try{preferred=root.navigator?.language||'';}catch(_){/* Default to English. */}
    const primary=typeof preferred==='string'?preferred.trim().toLowerCase().split('-')[0]:'';
    return primary==='ja'?'ja':'en';
  }
  let locale=browserLocale();
  try{const saved=root.localStorage?.getItem(KEY);if(saved==='ja'||saved==='en')locale=saved;}catch(_){/* Storage is optional. */}
  const t=value=>locale==='en'&&Object.hasOwn(messages,value)?messages[value]:value;
  function localize(value,key){
    if(key==='raw')return value; // Preserve original evidence bytes in both languages.
    if(typeof value==='string')return t(value);
    if(Array.isArray(value))return value.map(item=>localize(item));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([name,item])=>[name,localize(item,name)]));
    return value;
  }
  function persist(value){
    if(value!=='ja'&&value!=='en')return false;
    try{root.localStorage.setItem(KEY,value);return root.localStorage.getItem(KEY)===value;}catch(_){return false;}
  }
  function menu(){return `<label class="language-menu"><span>Language</span><select data-language aria-label="Language"><option value="ja" ${locale==='ja'?'selected':''}>日本語</option><option value="en" ${locale==='en'?'selected':''}>English</option></select></label>`;}
  function initPage(){
    if(!root.document)return;
    root.document.documentElement.lang=locale;
    root.document.title=locale==='ja'?'SOCroom — ブラウザでSOC勤務体験':'SOCroom — an SOC shift in your browser';
    const skip=root.document.querySelector('.skip');if(skip)skip.textContent=locale==='ja'?'調査画面へ':'Skip to investigation';
  }
  root.SocI18n=Object.freeze({locale,t,localize,persist,menu,initPage});
  initPage();
})(globalThis);
