/**
 * Opens the Loquent embed's shadow root as it is created.
 *
 * Loquent attaches a *closed* root, which nothing outside can reach — no
 * styling, no preselecting, no relabelling. Overriding `attachShadow` for this
 * one element is the only way in, and it has to be installed before the site
 * tag mounts the form, which is earlier than any React effect runs. So the
 * page emits this snippet inline, ahead of everything else on the route.
 *
 * The override removes itself the first time it fires: exactly one element on
 * the page carries `data-loquent-form`, and every other component on the site
 * keeps the native behaviour.
 */

export interface LoquentShadowBridge {
    /** Set once the embed's root exists. */
    root?: ShadowRoot
    /** Called with the root the moment it is created, if React got there first. */
    onRoot?: (root: ShadowRoot) => void
    /** Guards against the snippet running twice. */
    patched?: boolean
}

declare global {
    interface Window {
        __apsLoquent?: LoquentShadowBridge
    }
}

export const LOQUENT_SHADOW_PATCH = `(function(){
var w=window,b=w.__apsLoquent=w.__apsLoquent||{};
if(b.patched)return;
b.patched=true;
var native=Element.prototype.attachShadow;
Element.prototype.attachShadow=function(init){
if(!this.hasAttribute||!this.hasAttribute("data-loquent-form"))return native.call(this,init);
Element.prototype.attachShadow=native;
var root=native.call(this,{mode:"open"});
b.root=root;
if(typeof b.onRoot==="function")b.onRoot(root);
return root;
};
})();`
