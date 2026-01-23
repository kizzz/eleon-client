import { signal } from "@angular/core";
import { EcContainerItem, IEcContainerService } from '@eleon/contracts.lib'

export class EcContainerService extends IEcContainerService {

    // Now storing EcContainerItem[] under each key
    override readonly containers = signal<{ [key: string]: EcContainerItem[] }>({});

    /**
     * Adds an EcContainerItem to the specified container key.
     * @param key - The container key (e.g., 'topbar').
     * @param item - The EcContainerItem to add.
     */
    override addComponent(key: string, item: EcContainerItem) {
        this.containers.update((containers) => ({
            ...containers,
            [key]: [...(containers[key] || []), item], // Append to array
        }));
    }

    /**
     * Removes a specific EcContainerItem from a container key.
     * @param key - The container key.
     * @param item - The EcContainerItem to remove.
     */
    override removeComponent(key: string, item: EcContainerItem) {
        this.containers.update((containers) => ({
            ...containers,
            [key]: (containers[key] || []).filter(i => i !== item),
        }));
    }

    /**
     * Clears all EcContainerItems from a specific container key.
     * @param key - The container key.
     */
    override clearContainer(key: string) {
        this.containers.update((containers) => ({
            ...containers,
            [key]: [],
        }));
    }
}
