from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
output=root/'dist'/'iron-room-source.zip'
with ZipFile(output,'w',ZIP_DEFLATED) as z:
 for path in root.rglob('*'):
  if path.is_file() and path!=output and '.git' not in path.relative_to(root).parts and '.openai' not in path.relative_to(root).parts:
   z.write(path,'iron-room/'+str(path.relative_to(root)))
print(output)
