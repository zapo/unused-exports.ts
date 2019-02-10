#!/usr/bin/env node

import { Project, TypeGuards, Node, ExportSpecifier } from 'ts-morph';
import * as args from 'args';
import * as path from 'path';
const ERROR_FORMAT = '\x1b[33m%s\x1b[0m: \x1b[31m%s\x1b[0m';

function isExported(node: Node): boolean {
  return TypeGuards.isExportableNode(node) && node.isExported();
}

function nodeName(node: Node): string {
  return TypeGuards.hasName(node) ? node.getName() : node.getText();
}

function checkNode(node: Node): boolean {
  if (!TypeGuards.isReferenceFindableNode(node)) { return true; }

  const file = node.getSourceFile();
  const parent = node.getParent();

  const parentFile = parent && TypeGuards.isSourceFile(parent) && parent;
  let namedExport: ExportSpecifier | undefined;
  const declarations = parentFile ? parentFile.getExportDeclarations() : [];

  for (const d of declarations) {
    if (!d.hasNamedExports()) { continue; }
    if (namedExport) { break; }
    namedExport = d.getNamedExports().find((n) => nodeName(n) === nodeName(node));
  };

  const aliasedNode = namedExport && namedExport.getAliasNode();
  const referrableNode = aliasedNode || node;


  const hasRefs = referrableNode.findReferencesAsNodes()
    .filter((n) => n.getSourceFile() !== file)
    .length;

  const fileref = `${file.getFilePath()}:${node.getStartLineNumber()}`
  !hasRefs && console.error(ERROR_FORMAT, fileref, nodeName(node));
  return !hasRefs;
}

function run(tsConfigFilePath: string, patterns: string[]): boolean {
  const project = new Project({ tsConfigFilePath });
  process.chdir(path.dirname(tsConfigFilePath))

  let pass = true;

  for (const file of project.getSourceFiles(patterns)) {
    file.forEachChild((child) => {
      if (TypeGuards.isVariableStatement(child)) {
        if (isExported(child)) {
          for (const node of child.getDeclarations()) {
            pass = checkNode(node) && pass;
          }
        }
      } else if (isExported(child)) {
        pass = checkNode(child) && pass;
      }
    });
  }

  return pass;
}

const DEFAULT_TSCONFIG = path.join(process.cwd(), 'tsconfig.json');
args.option('config', 'Path to tsconfig.json', DEFAULT_TSCONFIG);
const flags = args.parse(process.argv)
const patterns = args.sub.length ? args.sub : ['./**/*'];

process.exit(run(flags.config, patterns) ? 0 : 1);
