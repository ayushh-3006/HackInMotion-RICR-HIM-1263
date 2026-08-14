import fs from "fs";
import path from "path";

function fixThemes(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith(".tsx")) {
      const fullPath = path.join(dir, file);
      let content = fs.readFileSync(fullPath, "utf-8");

      // Fix implicit any on map callbacks
      content = content.replace(/\(exp, /g, "(exp: any, ");
      content = content.replace(/\(exp\)/g, "(exp: any)");
      content = content.replace(/\(edu, /g, "(edu: any, ");
      content = content.replace(/\(edu\)/g, "(edu: any)");
      content = content.replace(/\(proj, /g, "(proj: any, ");
      content = content.replace(/\(proj\)/g, "(proj: any)");
      content = content.replace(/\(cert, /g, "(cert: any, ");
      content = content.replace(/\(cert\)/g, "(cert: any)");

      // Fix possibly undefined arrays
      content = content.replace(
        /data\.experience\.map/g,
        "(data.experience || []).map",
      );
      content = content.replace(
        /data\.education\.map/g,
        "(data.education || []).map",
      );
      content = content.replace(
        /data\.projects\.map/g,
        "(data.projects || []).map",
      );
      content = content.replace(
        /data\.certifications\.map/g,
        "(data.certifications || []).map",
      );

      fs.writeFileSync(fullPath, content, "utf-8");
      console.log(`Fixed types in ${fullPath}`);
    }
  }
}

fixThemes("./components/ResumeThemes");
