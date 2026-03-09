<script lang="ts">
  import { onMount, setContext } from "svelte";
  import Display from "./Display.svelte";
  import Section from "./Section.svelte";
  import DragDropList from "./DragDropList.svelte";
  import ConfigDrawer from "./ConfigDrawer.svelte";
  import GenerationDrawer from "./GenerationDrawer.svelte";
  import SettingsMenu from "./SettingsMenu.svelte";
  import { applyTheme, theme } from "./theme";
  import {
    type FileEntry,
    pickDirectory,
    readDirectory,
    saveFile,
    storeHandle,
    tryRestoreHandle,
  } from "./fileSystem";
  import { localStorageData } from "./localStorageData";
  import { loadImageFromPath, overwriteImage } from "./loadImages";
  import {
    Button,
    Card,
    Checkbox,
    Chip,
    Group,
    Input,
    Popper,
    SvelteUIProvider,
    Tabs,
    Text,
    Title,
  } from "@svelteuidev/core";
  import Fa from "svelte-fa";
  import {
    faFileExport,
    faTrash,
    faTimes,
    faSpinner,
    faCheck,
    faCheckCircle,
    faDice,
    faMinus,
    faCopy,
  } from "@fortawesome/free-solid-svg-icons";
  import {
    getPalette,
    swapPalette,
    type palette,
    pixelComparator,
  } from "./utils";
  import { rand } from "@svelteuidev/composables";

  const selected = localStorageData<
    { path: string; index: number; name: string }[]
  >("selected", []);

  const characterName = localStorageData("characterName", "");
  const targetDirectory = localStorageData("targetDir", "");

  let rootFolder: FileEntry[] = [];
  const rootDir = localStorageData("root", "");
  let rootDirHandle: FileSystemDirectoryHandle | null = null;
  let weaponsFolder: FileEntry[] = [];
  const weaponsDir = localStorageData("weaponsDir", "");
  let weaponsDirHandle: FileSystemDirectoryHandle | null = null;
  let crafting1Folder: FileEntry[] = [];
  const crafting1Dir = localStorageData("crafting1", "");
  let crafting1DirHandle: FileSystemDirectoryHandle | null = null;
  let crafting2Folder: FileEntry[] = [];
  const crafting2Dir = localStorageData("crafting2", "");
  let crafting2DirHandle: FileSystemDirectoryHandle | null = null;
  let addonsFolder: FileEntry[] = [];
  const addonsDir = localStorageData("addons", "");
  let addonsDirHandle: FileSystemDirectoryHandle | null = null;
  let targetDirHandle: FileSystemDirectoryHandle | null = null;

  const loadTree = async () => {
    if (!rootDirHandle) return;
    rootFolder = await readDirectory(rootDirHandle);
  };

  const loadWeapons = async () => {
    if (!weaponsDirHandle) return;
    const loadedWeapons = await readDirectory(weaponsDirHandle);
    weaponsFolder = loadedWeapons.map((x) => {
      if (x.name?.includes("Swing")) {
        const newChildren = x.children?.map((c) => {
          if (c.name?.includes(".png")) {
            return {
              name: c.name.split(/[._]/).at(-2),
              children: [
                { name: c.name + "_f.png", path: c.path },
                { name: c.name + "_b.png", path: c.path },
              ],
            };
          }
          return c;
        }) as FileEntry[];

        return { ...x, children: newChildren };
      }
      return x;
    });
  };
  const loadCrafting1 = async () => {
    if (!crafting1DirHandle) return;
    crafting1Folder = await readDirectory(crafting1DirHandle);
  };
  const loadCrafting2 = async () => {
    if (!crafting2DirHandle) return;
    crafting2Folder = await readDirectory(crafting2DirHandle);
  };
  const loadAddons = async () => {
    if (!addonsDirHandle) return;
    addonsFolder = await readDirectory(addonsDirHandle);
  };
  onMount(async () => {
    applyTheme(theme.value);
    // Try to restore previously selected directories from IndexedDB
    rootDirHandle = await tryRestoreHandle("root");
    if (rootDirHandle) {
      rootDir.value = rootDirHandle.name;
      loadTree();
    }
    weaponsDirHandle = await tryRestoreHandle("weapons");
    if (weaponsDirHandle) {
      weaponsDir.value = weaponsDirHandle.name;
      loadWeapons();
    }
    crafting1DirHandle = await tryRestoreHandle("crafting1");
    if (crafting1DirHandle) {
      crafting1Dir.value = crafting1DirHandle.name;
      loadCrafting1();
    }
    crafting2DirHandle = await tryRestoreHandle("crafting2");
    if (crafting2DirHandle) {
      crafting2Dir.value = crafting2DirHandle.name;
      loadCrafting2();
    }
    addonsDirHandle = await tryRestoreHandle("addons");
    if (addonsDirHandle) {
      addonsDir.value = addonsDirHandle.name;
      loadAddons();
    }
    targetDirHandle = await tryRestoreHandle("target", "readwrite");
    if (targetDirHandle) {
      targetDirectory.value = targetDirHandle.name;
    }
  });

  const selectRootDirectory = async () => {
    const handle = await pickDirectory();
    if (handle) {
      if (handle.name === "Generic_NPCs") {
        rootDirHandle = handle;
        rootDir.value = handle.name;
        await storeHandle("root", handle);
        loadTree();
      } else {
        alert(
          'The source directory is the one named "Generic_NPCs" and contain the animation folders',
        );
      }
    }
  };
  const selectWeaponsDir = async () => {
    const handle = await pickDirectory();
    if (handle) {
      if (handle.name === "Minifantasy_Weapons_Assets") {
        weaponsDirHandle = handle;
        weaponsDir.value = handle.name;
        await storeHandle("weapons", handle);
        loadWeapons();
      } else {
        alert(
          'The source directory is the one named "Minifantasy_Weapons_Assets"',
        );
      }
    }
  };
  const selectCrafting1Dir = async () => {
    const handle = await pickDirectory();
    if (handle) {
      crafting1DirHandle = handle;
      crafting1Dir.value = handle.name;
      await storeHandle("crafting1", handle);
      loadCrafting1();
    }
  };
  const selectCrafting2Dir = async () => {
    const handle = await pickDirectory();
    if (handle) {
      crafting2DirHandle = handle;
      crafting2Dir.value = handle.name;
      await storeHandle("crafting2", handle);
      loadCrafting2();
    }
  };
  const selectUnarmedDir = async () => {
    const handle = await pickDirectory();
    if (handle) {
      addonsDirHandle = handle;
      addonsDir.value = handle.name;
      await storeHandle("addons", handle);
      loadAddons();
    }
  };
  const selectTargetDir = async () => {
    const handle = await pickDirectory("readwrite");
    if (handle) {
      targetDirHandle = handle;
      targetDirectory.value = handle.name;
      await storeHandle("target", handle);
    }
  };
  const selectedAnimations = localStorageData<string[]>("weaponsSelected", []);
  const selectWeapon = (name?: string) => {
    if (name) {
      selectedAnimations.value = selectedAnimations.value.includes(name)
        ? selectedAnimations.value.filter((x) => x !== name)
        : [...selectedAnimations.value, name];
    }
  };

  const select = (event: {
    detail: { path: string; index: number; name: string };
  }) => {
    if (
      selected.value.some(
        (x) => x.name === event.detail.name && x.path !== event.detail.path,
      )
    ) {
      selected.value = selected.value.map((x) =>
        x.name === event.detail.name ? event.detail : x,
      );
    } else {
      selected.value = selected.value.some((x) => x.path === event.detail.path)
        ? selected.value.filter((x) => x.path !== event.detail.path)
        : [...selected.value, event.detail];
    }
  };

  const sortList = (ev: CustomEvent) => {
    selected.value = ev.detail;
  };

  const saveBuffer = async (
    buffer: HTMLCanvasElement,
    name: string = "NPC",
  ) => {
    if (!targetDirHandle) {
      await selectTargetDir();
    }
    if (targetDirHandle) {
      const blob = await new Promise<Blob | null>((res) =>
        buffer.toBlob(res, "png"),
      );
      if (blob) {
        await saveFile(targetDirHandle, name + ".png", blob);
      }
    }
  };
  $: race = selected.value
    .find((x) => x.path.includes("_Character"))
    ?.path.split(/[\\/]/)
    .at(-2) as "Elf" | "Human" | "Orc";
  $: baseColor = {
    Elf: "elfskin",
    Human: "whiteskin",
    Orc: "greenskin",
  }[race];
  const findCorrespondingHuman = async () => {
    const humanWalk = rootFolder
      ?.find((x) => x?.name === "Walk")
      ?.children?.find((x) => x?.name === "_Characters")
      ?.children?.find((x) => x?.name === race)
      ?.children?.find((x) => x.path.includes(baseColor));
    return await loadImageFromPath(humanWalk!.path);
  };

  const getWeaponAnimations = async (
    animationData: animationData,
    images: (HTMLImageElement | HTMLCanvasElement)[],
    palette: palette,
    characterIndex: number,
  ) => {
    if (!animationData.character) return;
    const selectedCharacter = await loadImageFromPath(animationData.character);
    const characterPaletteSwapped = swapPalette(selectedCharacter, palette);
    const front = animationData.front
      ? await loadImageFromPath(animationData.front)
      : null;
    const back = animationData.back
      ? await loadImageFromPath(animationData.back)
      : null;
    const buffer = document.createElement("canvas");
    buffer.width = selectedCharacter.width;
    buffer.height = selectedCharacter.height;
    const ctx = buffer.getContext("2d", { alpha: true });
    back && ctx?.drawImage(back, 0, 0);
    ctx?.drawImage(characterPaletteSwapped, 0, 0);
    for (let i = 1; i < images.length; i++) {
      const img = images[i];
      const [comparator, width] = pixelComparator(selected.value[i].path);
      for (let x = 0; x < buffer.width; x += 32) {
        for (let y = 0; y < buffer.height; y += 32) {
          for (let foot = 0; foot < 32; foot += width) {
            const [imgX, imgY] = comparator(images[characterIndex], 0, y, foot);
            const [offsetX, offsetY] = comparator(
              selectedCharacter,
              x,
              y,
              foot,
            );

            if (!(offsetX === 0 && offsetY === 0)) {
              const newX = x + offsetX - imgX;
              const newY = y + offsetY - imgY;
              if (offsetX + offsetY != 0) {
                ctx?.drawImage(
                  img,
                  0 + foot,
                  y,
                  width,
                  32,
                  newX + foot,
                  newY,
                  width,
                  32,
                );
              }
            }
          }
        }
      }
    }
    front && ctx?.drawImage(front, 0, 0);
    if (ctx) {
      saveBuffer(ctx.canvas, characterName.value + animationData.name);
    }
    for (const additionalAnimations of animationData.more) {
      getWeaponAnimations(
        additionalAnimations,
        images,
        palette,
        characterIndex,
      );
    }
  };

  const generateSprites = async () => {
    loading = true;
    const individualSprites: HTMLCanvasElement[] = [];
    const animations = rootFolder.filter((folder) => folder.children);
    if (!selected.value.some((x) => x.path.includes("_Character"))) {
      loading = false;
      alert(
        "at least one base character is needed to generate the animations",
      );
      return;
    }
    for (const { name } of animations) {
      if (!name) return;
      const buffer = document.createElement("canvas");
      buffer.width = 0;
      buffer.height = 0;
      const ctx = buffer.getContext("2d", { alpha: true })!;
      ctx.imageSmoothingEnabled = false;

      const images: (HTMLImageElement | HTMLCanvasElement)[] = [];
      for (const { path } of selected.value) {
        images.push(await loadImageFromPath(path.replaceAll("Idle", name)));
      }
      for (const img of images) {
        buffer.width ||= img.width;
        buffer.height ||= img.height;
        ctx?.drawImage(img, 0, 0, img.width, img.height);
      }
      if (name === "Walk" && weaponsFolder.length) {
        for (const animation of selectedAnimations.value) {
          const humanWalk = await findCorrespondingHuman();
          const characterIndex = selected.value.findIndex((x) =>
            x.path.includes("_Character"),
          );
          const data = await getAnimationData();

          const palette = getPalette(humanWalk, images[characterIndex]);
          if (data[animation]) {
            await getWeaponAnimations(
              data[animation],
              images,
              palette,
              characterIndex,
            );
          }
        }
      }
      individualSprites.push(buffer);
    }

    for (let i = 0; i < individualSprites.length; i++) {
      await saveBuffer(
        individualSprites[i],
        characterName.value + animations[i].name,
      );
    }
    loading = false;
    finished = true;
    setTimeout(() => (finished = false), 1000);
  };

  $: idle = rootFolder.find((x) => x.name === "Idle")?.children;
  const findCharacterFolder = (folder: FileEntry): FileEntry | null => {
    let found: FileEntry | null = null;
    const find = (folder: FileEntry) => {
      if (folder.children) {
        for (const children of folder.children) {
          if (children.name?.includes("Character")) {
            found = children;
          } else if (children.children) {
            find(children);
          }
        }
      }
    };
    find(folder);
    return found;
  };

  const getWeaponsEntries = (folders: FileEntry[]) => {
    return folders.filter(
      (f) =>
        "children" in f &&
        ["_", "Character", "GIF"].every((x) => !f.name?.includes(x)),
    );
  };
  type animationData = {
    character?: string;
    front?: string;
    back?: string;
    more: animationData[];
    name: string;
  };
  const findImagePath = (folder: FileEntry, key: string) =>
    folder?.children?.find((x) => x.name?.split(/[_.]/).at(-2) === key)?.path;

  const getAnimationData = () => {
    const result: Record<string, animationData> = {};
    // Weapons;
    const charged = weaponsFolder.find((x) => x.name?.includes("Charged"));
    for (const folder of weaponsFolder) {
      if (!folder.name?.includes("Charged")) {
        const characters = findCharacterFolder(folder);
        if (characters) {
          for (const weapon of folder?.children ?? []) {
            if (weapon.name && !weapon.name.includes("_") && weapon.children) {
              const character = findImagePath(characters, race?.toLowerCase());
              const front = findImagePath(weapon, "f");
              const back = findImagePath(weapon, "b");
              const res: animationData = {
                character,
                front,
                back,
                more: [],
                name: weapon.name,
              };
              const chargedFolder = charged?.children
                ?.map((x) => x.children)
                .flat()
                .find((x) => x?.name === weapon.name);
              if (chargedFolder) {
                const chargedFront = findImagePath(chargedFolder, "f");
                const chargedBack = findImagePath(chargedFolder, "b");
                const more = {
                  character,
                  front: chargedFront,
                  back: chargedBack,
                  more: [],
                  name: "Charged" + weapon.name,
                };
                res.more.push(more);
              }
              result[weapon.name] = res;
            }
          }
        }
      }
    }
    // Crafting
    for (const profession of [...crafting1Folder, ...crafting2Folder]) {
      for (const folder of profession.children ?? []) {
        const characters = findCharacterFolder(folder);
        if (characters && folder.name) {
          const character = characters?.children?.find((x) =>
            x.name?.includes(race?.toLowerCase()),
          )?.path;
          result[folder.name] = { character, more: [], name: folder.name };
        }
      }
    }
    // Addons
    for (const folder of addonsFolder) {
      if (folder.name === "Unarmed" && folder.children) {
        for (const weapon of folder.children) {
          const characters = findCharacterFolder(weapon);
          if (characters && weapon.name && weapon.children) {
            const character = findImagePath(characters, race?.toLowerCase());
            const front = weapon.children.find(
              (c) => c.name?.split(".")?.at(-2)?.at(-1) === "f",
            )?.path;
            const back = weapon.children.find(
              (c) => c.name?.split(".")?.at(-2)?.at(-1) === "b",
            )?.path;
            const res: animationData = {
              character,
              front,
              back,
              more: [],
              name: weapon.name,
            };
            result[weapon.name] = res;
          }
        }
      } else {
        const characters = findCharacterFolder(folder);
        if (characters) {
          for (const weapon of folder?.children ?? []) {
            if (weapon.name && !weapon.name.includes("_") && weapon.children) {
              const character = findImagePath(characters, race?.toLowerCase());
              const front = findImagePath(weapon, "front");
              const back = findImagePath(weapon, "back");
              const res: animationData = {
                character,
                front,
                back,
                more: [],
                name: weapon.name,
              };
              result[weapon.name] = res;
            }
          }
        }
      }
    }
    return result;
  };
  let loading = false;
  let finished = false;
  let layerTooltipPath: string | null = null;
  let layerTooltip: { tab: string; category: string; item: string; fullPath: string; copied: boolean; x: number; y: number } | null = null;

  const folderToTab: Record<string, string> = {
    _Characters: "Bodies",
    Head: "Hair/Headwear",
    Body: "Clothing",
  };

  function showLayerTooltip(e: MouseEvent, item: { path: string; name: string }) {
    if (layerTooltipPath === item.path) {
      layerTooltipPath = null;
      layerTooltip = null;
      return;
    }
    const el = (e.currentTarget as HTMLElement);
    const rect = el.getBoundingClientRect();
    layerTooltipPath = item.path;
    const parts = item.path.split('/');
    const tab = folderToTab[parts[0]] ?? parts[0];
    const afterCategory = parts.slice(1);
    const label = afterCategory
      .map((p) => p.replace(/\.png$/i, ''))
      .join(' / ');
    const fullPath = rootDir.value ? `${rootDir.value}/${item.path}` : item.path;
    layerTooltip = {
      category: item.name,
      tab,
      item: label,
      fullPath,
      copied: false,
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
  }

  function copyLayerPath() {
    if (!layerTooltip) return;
    navigator.clipboard.writeText(layerTooltip.fullPath);
    layerTooltip = { ...layerTooltip, copied: true };
    setTimeout(() => {
      if (layerTooltip) layerTooltip = { ...layerTooltip, copied: false };
    }, 1500);
  }
  $: directoryConfigs = [
    {
      key: "root",
      label: "NPC Assets",
      description:
        "Select the Generic_NPCs folder from the Minifantasy Myriad of NPCs asset pack.",
      links: [
        {
          label: "Minifantasy NPCs on itch.io",
          url: "https://krishna-palacio.itch.io/minifantasy-npcs",
        },
      ],
      value: rootDir.value,
      required: true,
      onSelect: selectRootDirectory,
    },
    {
      key: "target",
      label: "Output Directory",
      description: "Choose where generated sprite sheets will be saved.",
      links: [],
      value: targetDirectory.value,
      required: true,
      onSelect: selectTargetDir,
    },
    {
      key: "weapons",
      label: "Weapon Assets",
      description:
        "Select the Minifantasy_Weapons_Assets folder for weapon animations.",
      links: [
        {
          label: "Minifantasy Weapons on itch.io",
          url: "https://krishna-palacio.itch.io/minifantasy-weapons",
        },
      ],
      value: weaponsDir.value,
      required: false,
      onSelect: selectWeaponsDir,
    },
    {
      key: "addons",
      label: "Addon Assets",
      description:
        "Additional weapon animation packs (unarmed, magic weapons, etc).",
      links: [
        {
          label: "Magic Weapons & Effects",
          url: "https://krishna-palacio.itch.io/minifantasy-magic-weapons-and-effects",
        },
        {
          label: "Exclusive Weapon Addons (Patreon)",
          url: "https://www.patreon.com/posts/exclusive-weapon-59316645",
        },
      ],
      value: addonsDir.value,
      required: false,
      onSelect: selectUnarmedDir,
    },
    {
      key: "crafting1",
      label: "Crafting I",
      description: "Crafting & Professions I animation pack.",
      links: [
        {
          label: "Crafting & Professions I on itch.io",
          url: "https://krishna-palacio.itch.io/minifantasy-crafting-and-professions-i",
        },
      ],
      value: crafting1Dir.value,
      required: false,
      onSelect: selectCrafting1Dir,
    },
    {
      key: "crafting2",
      label: "Crafting II",
      description: "Crafting & Professions II animation pack.",
      links: [
        {
          label: "Crafting & Professions II on itch.io",
          url: "https://krishna-palacio.itch.io/minifantasy-crafting-and-professions-ii",
        },
      ],
      value: crafting2Dir.value,
      required: false,
      onSelect: selectCrafting2Dir,
    },
  ];
  // Animation selection counts
  const getAllWeaponNames = (folders: FileEntry[]) => {
    const names: string[] = [];
    for (const { name, children } of folders) {
      if (name && children) {
        for (const w of getWeaponsEntries(children)) {
          if (w.name) names.push(w.name);
        }
      }
    }
    return names;
  };
  $: weaponAnimNames = [
    ...getAllWeaponNames(weaponsFolder.filter((x) => !x.name?.includes("harged"))),
    ...getAllWeaponNames(addonsFolder.filter((x) => !x.name?.includes("Diag"))),
  ];
  $: weaponsSelectedCount = weaponAnimNames.filter((n) => selectedAnimations.value.includes(n)).length;
  $: craftingAnimNames = (() => {
    const names: string[] = [];
    for (const folder of [crafting1Folder, crafting2Folder]) {
      for (const prof of folder.filter((x) => x.name?.includes("Prof") && x?.children)) {
        if (prof.name && prof.children) {
          for (const w of getWeaponsEntries(prof.children).filter(findCharacterFolder)) {
            if (w.name) names.push(w.name);
          }
        }
      }
    }
    return names;
  })();
  $: craftingSelectedCount = craftingAnimNames.filter((n) => selectedAnimations.value.includes(n)).length;

  // Animation tab state & toggle logic
  let activeAnimTab: "weapons" | "crafting" = "weapons";
  $: allAnimNames = [...weaponAnimNames, ...craftingAnimNames];
  $: allAnimSelectedCount = allAnimNames.filter((n) => selectedAnimations.value.includes(n)).length;

  const toggleAnimGroup = (names: string[]) => {
    const allSelected = names.length > 0 && names.every((n) => selectedAnimations.value.includes(n));
    if (allSelected) {
      selectedAnimations.value = selectedAnimations.value.filter((n) => !names.includes(n));
    } else {
      const toAdd = names.filter((n) => !selectedAnimations.value.includes(n));
      selectedAnimations.value = [...selectedAnimations.value, ...toAdd];
    }
  };

  // Random Menu
  let reference: HTMLButtonElement;
  let showRandomMenu = false;
  const random = localStorageData<Record<string, string[]>>("random", {
    Head: [],
    Body: [],
    _Characters: [],
  });
  const allRandomCategories = [["Bodies", "_Characters"], ["Hair/Headwear", "Head"], ["Clothing", "Body"]] as const;
  const selectAllRandom = () => {
    if (!idle) return;
    const newRandom: Record<string, string[]> = {};
    for (const [, name] of allRandomCategories) {
      const children = idle.find((x) => x.name === name)?.children ?? [];
      newRandom[name] = children.filter((c) => c.name).map((c) => c.name!);
    }
    random.value = newRandom;
  };
  const deselectAllRandom = () => {
    random.value = { Head: [], Body: [], _Characters: [] };
  };
  $: allSelected = idle
    ? allRandomCategories.every(([, name]) => {
        const children = idle!.find((x) => x.name === name)?.children ?? [];
        const available = children.filter((c) => c.name).map((c) => c.name!);
        return available.length > 0 && available.every((n) => random.value[name]?.includes(n));
      })
    : false;
  const singleSelectCategories = ["_Characters"];
  const addRandom = (place: string, piece: string) => {
    if (singleSelectCategories.includes(place)) {
      // Radio-style: select this one or deselect if already selected
      random.value = {
        ...random.value,
        [place]: random.value[place].includes(piece) ? [] : [piece],
      };
    } else {
      random.value = {
        ...random.value,
        [place]: random.value[place].includes(piece)
          ? random.value[place].filter((x) => x !== piece)
          : [...random.value[place], piece],
      };
    }
  };
  const generateRandom = () => {
    for (const [place, pieces] of Object.entries(random.value)) {
      const folder = idle?.find((x) => x.name === place);
      if (!folder) continue;
      for (const piece of pieces) {
        const subFolder = folder.children
          ?.find((x) => x.name === piece)
          ?.children?.filter(
            (x) => !selected.value.some((y) => y.path === x.path),
          );
        if (!subFolder) continue;
        let randomSelected =
          subFolder[Math.floor(Math.random() * subFolder.length)];
        if (randomSelected.children?.length) {
          randomSelected =
            randomSelected.children[
              Math.floor(Math.random() * randomSelected.children.length)
            ];
        }
        if (!randomSelected.name) return;
        const newSelected = {
          name: piece,
          path: randomSelected.path,
          index: 0,
        };

        selected.value = selected.value.some((x) => x.name === piece)
          ? selected.value.map((x) => (x.name === piece ? newSelected : x))
          : [...selected.value, newSelected];
      }
    }
  };
  const randomizeName = () => {
    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const coin = () => Math.random() < 0.5;

    // Onset clusters and single consonants
    const onsets = [
      "B","Br","C","Ch","Cr","D","Dr","F","Fl","Fr","G","Gl","Gr",
      "H","J","K","Kh","Kr","L","M","N","P","Ph","Pr","Q","R",
      "S","Sc","Sh","Sk","Sl","Sm","Sn","St","Str","Sv","Sw",
      "T","Th","Tr","Tw","V","Vr","W","Wr","X","Y","Z","Zh",
    ];
    // Vowel nuclei (including diphthongs)
    const vowels = [
      "a","e","i","o","u","ae","ai","au","ea","ei","ia","ie","io",
      "oa","oe","ou","ue","y","ay","ey",
    ];
    // Coda consonants
    const codas = [
      "b","c","ck","d","dh","f","g","k","l","ll","lm","ln","ls","lt",
      "m","n","nd","ng","nk","nn","ns","nt","p","r","rc","rd","rg",
      "rk","rm","rn","rp","rs","rt","rv","rz","s","sh","sk","ss","st",
      "t","th","v","x","z",
    ];
    // Linking consonants for middle syllables
    const mids = [
      "b","br","c","ch","cr","d","dr","f","fr","g","gr","k","kr",
      "l","ldr","ll","m","mb","n","nd","ng","nn","p","ph","r","rr",
      "s","sh","st","str","t","th","tr","v","vr","w","x","z","zh",
    ];
    // Common fantasy suffixes for final syllable flavor
    const endings = [
      "an","en","in","on","un","ar","er","ir","or","ur",
      "ath","eth","ith","oth","as","es","is","os","us",
      "ael","iel","ael","wen","wyn","dor","mir","ric","thar",
      "ven","dal","grim","hard","mund","rak","zul","nir","vyn",
      "ax","ox","ux","al","el","il","ol","ak","ek","ik","ok","uk",
    ];
    // Titles and epithets
    const titles = [
      "the Bold","the Brave","the Cunning","the Dark","the Elder",
      "the Fair","the Grim","the Humble","the Iron","the Just",
      "the Kind","the Lost","the Mad","the Noble","the Old",
      "the Pale","the Quick","the Red","the Silent","the Tall",
      "the Undying","the Vile","the Wanderer","the Young",
      "Blackthorn","Brightblade","Coldforge","Dawnwalker",
      "Emberhand","Frostborn","Goldmane","Hollowbone",
      "Ironvow","Ashwhisper","Stormcaller","Nighthollow",
      "Moonveil","Thornweald","Shadowmere","Wyrmsbane",
    ];

    // Build 2-3 syllables
    const syllableCount = coin() ? 2 : 3;
    let name = pick(onsets) + pick(vowels);

    for (let i = 1; i < syllableCount; i++) {
      if (i < syllableCount - 1) {
        // Middle syllable
        name += pick(mids) + pick(vowels);
      } else {
        // Final syllable — use a fantasy ending or a constructed one
        if (coin()) {
          name += pick(endings);
        } else {
          name += pick(mids) + pick(vowels) + (coin() ? pick(codas) : "");
        }
      }
    }

    // Occasionally add a title/epithet (~30%)
    if (Math.random() < 0.3) {
      name += " " + pick(titles);
    }

    characterName.value = name;
  };
  const randomSingle = (files: FileEntry[] | undefined, piece: string) => {
    if (!files) return;
    files = files.filter((x) => !selected.value.some((y) => y.path === x.path));
    let randomSelected = files[Math.floor(Math.random() * files?.length)];
    if (randomSelected.children?.length) {
      randomSelected =
        randomSelected.children[
          Math.floor(Math.random() * randomSelected.children.length)
        ];
    }
    if (!randomSelected.name) return;
    const newSelected = {
      name: piece,
      path: randomSelected.path,
      index: 0,
    };

    selected.value = selected.value.some((x) => x.name === piece)
      ? selected.value.map((x) => (x.name === piece ? newSelected : x))
      : [...selected.value, newSelected];
  };
</script>

<svelte:window on:click={() => { if (showRandomMenu) showRandomMenu = false; layerTooltipPath = null; layerTooltip = null; }} />
<SvelteUIProvider themeObserver="dark">
  <Popper {reference} mounted={showRandomMenu} zIndex={20}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div on:click|stopPropagation>
    <Card style="display:grid;gap:0.5rem;max-height:70vh;overflow-y:auto;max-width:260px;padding:1rem;border:1px solid var(--theme-border)">
      <Button on:click={generateRandom} style="width:100%">
        <Fa slot="leftIcon" icon={faDice} />
        Randomize Selected
      </Button>
      <Button
        size="xs"
        compact
        color="gray"
        on:click={allSelected ? deselectAllRandom : selectAllRandom}
        style="width:100%"
      >
        {allSelected ? "Deselect All" : "Select All"}
      </Button>
      <Text size="xs" color="dimmed" style="line-height:1.3">
        Checked items will be randomized when you click the button above. Use the dice icon to randomize a single item.
      </Text>
      {#if idle}
        {#each allRandomCategories as [label, name]}
          <Text size="sm" weight="bold">{label}{singleSelectCategories.includes(name) ? " (pick one)" : ""}</Text>
          {#each idle.find((x) => x.name === name)?.children ?? [] as child}
            {#if child.name}
              <div
                style="margin-left:1rem;display:flex;justify-content:space-between"
              >
                {#if singleSelectCategories.includes(name)}
                  <label class="radio-row">
                    <input
                      type="radio"
                      name="random-{name}"
                      checked={random.value[name].includes(child.name)}
                      on:click={() => addRandom(name, child.name)}
                    />
                    {child.name}
                  </label>
                {:else}
                  <Checkbox
                    label={child.name}
                    checked={random.value[name].includes(child.name)}
                    on:click={addRandom(name, child.name)}
                  ></Checkbox>
                {/if}
                <Button
                  size="sm"
                  compact
                  color="gray"
                  on:click={randomSingle(child.children, child.name)}
                >
                  <Fa icon={faDice} /></Button
                >
              </div>
            {/if}
          {/each}
        {/each}
      {/if}
    </Card>
    </div>
  </Popper>
  <div class="app-layout">
    <ConfigDrawer directories={directoryConfigs} />
    <div class="center-section">
      <!-- TOP BAR -->
      <div class="top-bar">
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div on:click|stopPropagation style="display:contents">
          <Button
            bind:element={reference}
            on:click={() => (showRandomMenu = !showRandomMenu)}
          >
            <Fa slot="leftIcon" icon={faDice} />
            Randomize
          </Button>
        </div>
        <div class="name-group">
          <Input
            placeholder="Character name"
            style="padding:0.5rem"
            bind:value={characterName.value}
          />
          <button class="dice-btn" on:click={randomizeName} title="Random name">
            <Fa icon={faDice} />
          </button>
        </div>
        <SettingsMenu />
      </div>
      <!-- PANELS -->
      <div class="panels">
        <!-- ITEMS PANEL -->
        <div class="panel items-panel">
          {#if idle}
            <Tabs>
              {#each [["Bodies", "_Characters"], ["Hair/Headwear", "Head"], ["Clothing", "Body"]] as [label, name]}
                <Tabs.Tab {label}>
                  {#if idle.find((x) => x.name === name)?.children}
                    {#each idle.find((x) => x.name === name)?.children ?? [] as child}
                      <div>
                        <Section
                          name={child.name ?? ""}
                          children={child.children ?? []}
                          on:selected={select}
                          selected={selected.value}
                        />
                      </div>
                    {/each}
                  {/if}
                </Tabs.Tab>
              {/each}
            </Tabs>
          {/if}
        </div>
    <!-- CHARACTER PREVIEW -->
    <div class="panel preview-panel">
      <Card
        shadow="xl"
        radius="xl"
        style="display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr;background:transparent;border:none;"
      >
        {#each selected.value as img}
          {#key img.path}
            <div style="grid-area:1/1/1/1">
              <Display path={img.path} size={300} />
            </div>
          {/key}
        {/each}
      </Card>
    </div>
    <!-- LAYER LIST -->
    <div class="layers-panel">
      <div class="layers-header">
        <Button color="gray" size="sm" compact on:click={() => (selected.value = [])}>
          <Fa slot="leftIcon" icon={faTrash} />
          Clear
        </Button>
      </div>
      <div class="layers-scroll">
        <DragDropList
          list={selected.value}
          let:item
          key="path"
          on:sort={sortList}
        >
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <div
            class="layer-item"
            on:click|stopPropagation={(e) => showLayerTooltip(e, item)}
          >
            <button
              class="layer-remove"
              on:click|stopPropagation={() => select({ detail: item })}
              title="Remove"
            >
              <Fa icon={faTimes} size="xs" />
            </button>
            <Display path={item.path} />
          </div>
        </DragDropList>
      </div>
    </div>
    </div> <!-- /panels -->
    </div> <!-- /center-section -->
    <!-- GENERATION DRAWER (right side) -->
    <GenerationDrawer>
      <Button on:click={generateSprites} style="width:100%;margin-bottom:0.75rem">
        <Fa
          slot="leftIcon"
          icon={loading ? faSpinner : finished ? faCheckCircle : faFileExport}
          color={finished ? "var(--theme-success)" : ""}
          pulse={loading}
        />
        Generate Sprites
      </Button>
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="section-heading-row">
        <span class="tri-check" on:click={() => toggleAnimGroup(allAnimNames)}>
          {#if allAnimNames.length > 0 && allAnimSelectedCount === allAnimNames.length}
            <Fa icon={faCheck} size="xs" />
          {:else if allAnimSelectedCount > 0}
            <Fa icon={faMinus} size="xs" />
          {/if}
        </span>
        <h4 class="section-heading" style="margin-top:0">Action Animations</h4>
      </div>
      <!-- Custom tabs with checkboxes -->
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <div class="anim-tabs">
        <button
          class="anim-tab"
          class:active={activeAnimTab === "weapons"}
          on:click={() => (activeAnimTab = "weapons")}
        >
          <span class="tri-check" on:click|stopPropagation={() => toggleAnimGroup(weaponAnimNames)}>
            {#if weaponAnimNames.length > 0 && weaponsSelectedCount === weaponAnimNames.length}
              <Fa icon={faCheck} size="xs" />
            {:else if weaponsSelectedCount > 0}
              <Fa icon={faMinus} size="xs" />
            {/if}
          </span>
          Weapons{weaponsSelectedCount ? ` (${weaponsSelectedCount})` : ""}
        </button>
        <button
          class="anim-tab"
          class:active={activeAnimTab === "crafting"}
          on:click={() => (activeAnimTab = "crafting")}
        >
          <span class="tri-check" on:click|stopPropagation={() => toggleAnimGroup(craftingAnimNames)}>
            {#if craftingAnimNames.length > 0 && craftingSelectedCount === craftingAnimNames.length}
              <Fa icon={faCheck} size="xs" />
            {:else if craftingSelectedCount > 0}
              <Fa icon={faMinus} size="xs" />
            {/if}
          </span>
          Crafting{craftingSelectedCount ? ` (${craftingSelectedCount})` : ""}
        </button>
      </div>
      <!-- Tab content -->
      {#if activeAnimTab === "weapons"}
        <ul class="anim-list">
          {#each weaponsFolder.filter((x) => !x.name?.includes("harged")) as { name, children }}
            {#if name && children}
              <li>
                <span class="anim-category">{name?.replaceAll("_", " ")}</span>
                <ul class="anim-children">
                  {#each getWeaponsEntries(children) as weapon}
                    <li>
                      <button
                        class="anim-item"
                        class:selected={weapon.name && selectedAnimations.value.includes(weapon.name)}
                        on:click={() => selectWeapon(weapon.name)}
                      ><span class="anim-check">{#if weapon.name && selectedAnimations.value.includes(weapon.name)}<Fa icon={faCheck} size="xs" />{/if}</span>{weapon.name}</button>
                    </li>
                  {/each}
                </ul>
              </li>
            {/if}
          {/each}
          {#each addonsFolder.filter((x) => !x.name?.includes("Diag")) as { name, children }}
            {#if name && children}
              <li>
                <span class="anim-category">{name?.replaceAll("_", " ")}</span>
                <ul class="anim-children">
                  {#each getWeaponsEntries(children) as weapon}
                    <li>
                      <button
                        class="anim-item"
                        class:selected={weapon.name && selectedAnimations.value.includes(weapon.name)}
                        on:click={() => selectWeapon(weapon.name)}
                      ><span class="anim-check">{#if weapon.name && selectedAnimations.value.includes(weapon.name)}<Fa icon={faCheck} size="xs" />{/if}</span>{weapon.name}</button>
                    </li>
                  {/each}
                </ul>
              </li>
            {/if}
          {/each}
        </ul>
      {:else}
        <ul class="anim-list">
          {#each [crafting1Folder, crafting2Folder] as folder}
            {#each folder.filter((x) => x.name?.includes("Prof") && x?.children) as { name, children }}
              {#if name && children}
                <li>
                  <span class="anim-category">{name?.replaceAll("_", " ")}</span>
                  <ul class="anim-children">
                    {#each getWeaponsEntries(children).filter(findCharacterFolder) as weapon}
                      <li>
                        <button
                          class="anim-item"
                          class:selected={weapon.name && selectedAnimations.value.includes(weapon.name)}
                          on:click={() => selectWeapon(weapon.name)}
                        ><span class="anim-check">{#if weapon.name && selectedAnimations.value.includes(weapon.name)}<Fa icon={faCheck} size="xs" />{/if}</span>{weapon.name}</button>
                      </li>
                    {/each}
                  </ul>
                </li>
              {/if}
            {/each}
          {/each}
        </ul>
      {/if}
    </GenerationDrawer>
  </div>

  {#if layerTooltip}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
      class="layer-popover"
      style="left:{layerTooltip.x}px;top:{layerTooltip.y}px;"
      on:click|stopPropagation
    >
      <div class="layer-popover-breadcrumb">
        <span class="layer-popover-tab">{layerTooltip.tab}</span>
        <span class="layer-popover-sep">&rsaquo;</span>
        <span class="layer-popover-category">{layerTooltip.category}</span>
        <span class="layer-popover-sep">&rsaquo;</span>
        <span class="layer-popover-item">{layerTooltip.item}</span>
      </div>
      <div class="layer-popover-path-row">
        <span class="layer-popover-path">{layerTooltip.fullPath}</span>
        <button class="layer-popover-copy" on:click|stopPropagation={copyLayerPath} title="Copy path">
          {#if layerTooltip.copied}
            <Fa icon={faCheck} size="xs" />
          {:else}
            <Fa icon={faCopy} size="xs" />
          {/if}
        </button>
      </div>
    </div>
  {/if}
</SvelteUIProvider>

<style global>
  :global(.svelteui-AccordionItem-panel) {
    padding: 0px 0px 10px 0px !important;
  }
  :global(
      .svelteui-AccordionItem-controlContent:not(
          .svelteui-AccordionItem-root
            .svelteui-AccordionItem-root
            .svelteui-AccordionItem-controlContent
        )
    ) {
    text-decoration: underline;
    font-weight: bold;
  }

  /* Layout */
  .app-layout {
    position: relative;
    height: calc(100vh - 2rem);
  }
  .center-section {
    height: 100%;
    margin-left: 280px;
    margin-right: 300px;
    display: flex;
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.75rem;
    overflow: hidden;
  }

  /* Top bar */
  .top-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  .name-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1;
    justify-content: center;
  }
  .dice-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--theme-border);
    border-radius: 6px;
    background: var(--theme-secondary-btn);
    color: var(--theme-accent);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .dice-btn:hover {
    background: var(--theme-secondary-btn-hover);
    color: var(--theme-accent);
  }

  /* Panels */
  .panels {
    flex: 1;
    display: grid;
    grid-template-columns: 350px 550px auto;
    gap: 0.75rem;
    min-height: 0;
  }
  .panel {
    background: var(--theme-panel-bg);
    border: 1px solid var(--theme-border);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .items-panel {
    overflow-y: auto;
  }
  .preview-panel {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .layers-panel {
    min-width: 120px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .layers-header {
    padding: 0.5rem;
    flex-shrink: 0;
  }
  .layers-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0.25rem 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .layer-item {
    position: relative;
    display: grid;
    place-items: center;
    background: var(--theme-panel-bg);
    border: 1px solid var(--theme-border);
    border-radius: 8px;
    padding: 0.4rem;
    cursor: pointer;
  }
  .layer-remove {
    position: absolute;
    top: -8px;
    right: -8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid var(--theme-border);
    border-radius: 50%;
    background: var(--theme-panel-bg);
    color: var(--theme-text-secondary);
    cursor: pointer;
    z-index: 1;
    transition: background 0.15s, color 0.15s;
  }
  .layer-remove:hover {
    background: var(--theme-error);
    color: var(--theme-primary-btn-text);
    border-color: var(--theme-error);
  }

  .layer-popover {
    position: fixed;
    transform: translate(-50%, calc(-100% - 8px));
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.45rem 0.65rem;
    background: var(--theme-panel-bg);
    border: 1px solid var(--theme-border-light, var(--theme-border));
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    white-space: nowrap;
    user-select: text;
    cursor: default;
  }
  .layer-popover-breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .layer-popover-tab {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--theme-accent, var(--theme-text-secondary));
  }
  .layer-popover-category {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--theme-text-secondary);
  }
  .layer-popover-sep {
    font-size: 0.85rem;
    color: var(--theme-text-secondary);
    opacity: 0.5;
  }
  .layer-popover-item {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--theme-text-primary);
  }
  .layer-popover-path-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border-top: 1px solid var(--theme-border);
    padding-top: 0.3rem;
  }
  .layer-popover-path {
    font-size: 0.65rem;
    color: var(--theme-text-secondary);
    opacity: 0.75;
    user-select: text;
    cursor: text;
  }
  .layer-popover-copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--theme-text-secondary);
    cursor: pointer;
    flex-shrink: 0;
  }
  .layer-popover-copy:hover {
    background: var(--theme-border);
    color: var(--theme-text-primary);
  }

  /* Section headings in drawers */
  .section-heading-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.75rem 0 0.5rem 0;
  }
  .section-heading {
    margin: 0.75rem 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--theme-text-primary);
  }

  /* Tri-state checkbox */
  .tri-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 1px solid var(--theme-border-light);
    border-radius: 3px;
    background: transparent;
    color: var(--theme-accent);
    cursor: pointer;
    flex-shrink: 0;
  }
  .tri-check:hover {
    border-color: var(--theme-accent);
    background: var(--theme-panel-bg-light);
  }

  /* Custom animation tabs */
  .anim-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--theme-border);
    margin-bottom: 0.5rem;
  }
  .anim-tab {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--theme-text-secondary);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }
  .anim-tab:hover {
    color: var(--theme-text-primary);
  }
  .radio-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: var(--theme-text-primary);
    cursor: pointer;
  }

  .anim-tab.active {
    color: var(--theme-text-primary);
    border-bottom-color: var(--theme-accent);
  }

  /* Animation tree list */
  .anim-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .anim-list > li {
    margin-bottom: 0.5rem;
  }
  .anim-category {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--theme-text-secondary);
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--theme-border);
    margin-bottom: 0.2rem;
  }
  .anim-children {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .anim-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    text-align: left;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--theme-border);
    border-radius: 4px;
    background: transparent;
    color: var(--theme-text-primary);
    font-size: 0.8rem;
    cursor: pointer;
  }
  .anim-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    flex-shrink: 0;
  }
  .anim-item:hover {
    background: var(--theme-panel-bg-light);
  }
  .anim-item.selected {
    background: var(--theme-primary-btn);
    color: var(--theme-primary-btn-text);
  }
  .anim-item.selected:hover {
    background: var(--theme-primary-btn-hover);
  }
</style>
