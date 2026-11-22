/** Photo credits for sample images (all from Wikimedia Commons, free licences). */
export interface ImageCredit {
  title: string
  author: string
  license: string
  source: string
}

export const IMAGE_CREDITS: Record<string, ImageCredit> = {
  "lemon": {
    "title": "Lemon-edit1.jpg",
    "author": "André Karwath aka Aka",
    "license": "CC BY 2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Lemon-edit1.jpg"
  },
  "vinegar": {
    "title": "02023 0257 Apple cider vinegar.jpg",
    "author": "Silar",
    "license": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:02023_0257_Apple_cider_vinegar.jpg"
  },
  "orange": {
    "title": "Orange juice 1 edit1.jpg",
    "author": "Agency of the United States Department of Agriculture\nEdited Version by: Arad",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Orange_juice_1_edit1.jpg"
  },
  "soda": {
    "title": "Glass cola.jpg",
    "author": "pic_p_ter",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Glass_cola.jpg"
  },
  "water": {
    "title": "Glass-of-water.jpg",
    "author": "Derek Jensen (Tysto)",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Glass-of-water.jpg"
  },
  "salt": {
    "title": "Salt shaker on white background.jpg",
    "author": "Dubravko Sorić SoraZG on Flickr",
    "license": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Salt_shaker_on_white_background.jpg"
  },
  "bakingsoda": {
    "title": "Hydrogenuhličitan sodný.PNG",
    "author": "Ondřej Mangl",
    "license": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Hydrogenuhli%C4%8Ditan_sodn%C3%BD.PNG"
  },
  "soap": {
    "title": "Handmade soap.jpg",
    "author": "Malene Thyssen",
    "license": "CC BY 2.5",
    "source": "https://commons.wikimedia.org/wiki/File:Handmade_soap.jpg"
  },
  "ammonia": {
    "title": "Spray bottle.jpg",
    "author": "Hustvedt",
    "license": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Spray_bottle.jpg"
  }
}
