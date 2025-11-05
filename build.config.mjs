import { build } from "esbuild";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

const sharedConfig = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node22",
  external: ["aws-sdk"],
  sourcemap: true,
  minify: false,
  metafile: true,
};

async function buildForLambda() {
  try {
    console.log("🔨 Iniciando build para AWS Lambda...");
    
    // Crear directorios si no existen
    if (!existsSync("dist")) {
      mkdirSync("dist", { recursive: true });
    }
    
    if (!existsSync("releases")) {
      mkdirSync("releases", { recursive: true });
    }
    
    // Build para Lambda
    const result = await build({
      ...sharedConfig,
      outfile: "dist/index.js",
      format: "cjs",
    });

    console.log("✅ Build completado exitosamente");
    console.log(`📦 Tamaño del bundle: ${(result.metafile.outputs["dist/index.js"].bytes / 1024).toFixed(2)} KB`);
    
    // Crear package.json para el deploy
    const packageJson = {
      name: "ms-orders-lambda",
      version: "1.0.0",
      main: "index.js",
      type: "commonjs",
      dependencies: {},
    };
    
    writeFileSync(
      "dist/package.json",
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log("✅ package.json creado en dist/");
    console.log("✅ Listo para empaquetar y desplegar");
    
  } catch (error) {
    console.error("❌ Error en el build:", error);
    process.exit(1);
  }
}

buildForLambda();
