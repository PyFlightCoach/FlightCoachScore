
import type { ComponentType} from 'svelte';
import { writable, type Writable } from 'svelte/store';


export default writable(undefined) as Writable<ComponentType | undefined>;