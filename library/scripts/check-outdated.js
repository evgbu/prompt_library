import { exec } from 'child_process';

exec('npm outdated --json', (error, stdout, stderr) => {
  if (stdout) {
    try {
      const outdated = JSON.parse(stdout);
      const packages = Object.keys(outdated);
      if (packages.length === 0) {
        console.log('All dependencies are up to date.');
      } else {
        const updatable = packages.filter((pkg) => outdated[pkg].current !== outdated[pkg].wanted);
        if (updatable.length === 0) {
          console.log('No packages can be updated within their semver ranges.');
        } else {
          console.log('Packages that can be updated within semver range:');
          updatable.forEach((pkg) => {
            const info = outdated[pkg];
            console.log(`- ${pkg}: current ${info.current}, target ${info.wanted}`);
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse npm outdated output:', e.message);
    }
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  if (error) {
    // npm outdated exits with 1 if there are outdated packages, so only log if it's a real error
    if (error.code !== 1) {
      console.error(`Error: ${error.message}`);
    }
  }
});
