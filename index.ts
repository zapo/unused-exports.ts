#!/usr/bin/env node

import { Project, TypeGuards, Node } from 'ts-morph';
import * as args from 'args';
import * as path from 'path';

function isExported(node: Node) {
  return TypeGuards.isExportableNode(node) && node.isExported();
}

function checkNode(node: Node): boolean {
  if (!TypeGuards.isReferenceFindableNode(node)) { return true; }

  const file = node.getSourceFile();
  const hasRefs = node.findReferencesAsNodes()
    .filter((n) => n.getSourceFile() !== file)
    .length;

  const nodeName = TypeGuards.hasName(node) ? node.getName() : node.getText();
  const message = `[${file.getFilePath()}:${node.getStartLineNumber()}: ${nodeName}`;
  !hasRefs && console.error(message);
  return !hasRefs;
}

function run(tsConfigFilePath: string): boolean {
  const project = new Project({ tsConfigFilePath });
  process.chdir(path.dirname(tsConfigFilePath))

  const patterns = args.sub.length ? args.sub : ['./**/*'];
  let pass = true;

  for (const file of project.getSourceFiles(patterns)) {
    file.forEachChild((child) => {
      if (TypeGuards.isVariableStatement(child)) {
        if (isExported(child)) {
          child.getDeclarations().forEach((node) => {
            pass = checkNode(node) && pass;
          });
        }
      }
      else if (isExported(child)) {
        pass = checkNode(child) && pass;
      }
    });
  }

  return pass;
}

const DEFAULT_TSCONFIG = path.join(process.cwd(), 'tsconfig.json');
args.option('config', 'Path to tsconfig.json', DEFAULT_TSCONFIG);
const flags = args.parse(process.argv)

process.exit(run(flags.config) ? 0 : 1);
