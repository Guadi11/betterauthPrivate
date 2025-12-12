// helpers/konva-serialize.ts
import Konva from 'konva';

export function cleanupStage(stage: Konva.Stage): void {
  // 1) fuera transformers persistidos
  stage.find('Transformer').forEach((n) => n.destroy());

  // 2) fuera TODAS las capas de grilla previas
  stage.find('.__gridLayer__').forEach((n) => n.destroy());

  // 3) quedarnos con UNA sola capa editable
  const nonGridLayers = stage.getLayers().filter((l) => !l.hasName('__gridLayer__'));
  if (nonGridLayers.length === 0) {
    const editable = new Konva.Layer({ name: '__editable__' });
    stage.add(editable);
    return;
  }
  const keep = nonGridLayers[0];
  keep.name('__editable__');
  for (let i = 1; i < nonGridLayers.length; i++) {
    const extra = nonGridLayers[i];
    extra.getChildren().forEach((child) => keep.add(child));
    extra.destroy();
  }
}

export function serializeStagePruned(stage: Konva.Stage): string {
  // clonamos para no tocar el stage real
  const clone = stage.clone({ container: undefined }) as Konva.Stage;

  // removemos ruido del clon
  clone.find('Transformer').forEach((n) => n.destroy());
  clone.find('.__gridLayer__').forEach((n) => n.destroy());

  // opcional: asegurar una sola capa editable también en el clon
  const layers = clone.getLayers().filter((l) => !l.hasName('__gridLayer__'));
  if (layers.length === 0) {
    clone.add(new Konva.Layer({ name: '__editable__' }));
  } else {
    const keep = layers[0];
    keep.name('__editable__');
    for (let i = 1; i < layers.length; i++) {
      const extra = layers[i];
      extra.getChildren().forEach((c) => keep.add(c));
      extra.destroy();
    }
  }

  // devolver JSON compacto
  const json = clone.toJSON();
  clone.destroy();
  return json;
}
