import type {TSESTree} from '@typescript-eslint/utils';
import {ESLintUtils} from '@typescript-eslint/utils';
import ts from 'typescript';

const defaultConfigFnregExp = /^get([a-zA-Z]*)DefaultConfig$/;

function visitConfigFunctionDeclaration(functionDeclaration: ts.FunctionDeclaration, typeChecker: ts.TypeChecker) {
	const lastStatement = functionDeclaration.body!.statements.at(-1);
	const docProperties: Record<string, string> = {};
	if (ts.isReturnStatement(lastStatement!)) {
		let expression = lastStatement.expression;
		if (ts.isAsExpression(expression!)) {
			expression = expression.expression;
		}
		if (ts.isObjectLiteralExpression(expression!)) {
			for (const spreadAssignment of expression.properties) {
				if (ts.isSpreadAssignment(spreadAssignment)) {
					const spreadExpression = spreadAssignment.expression;
					if (ts.isCallExpression(spreadExpression)) {
						let symbol = typeChecker.getSymbolAtLocation(spreadExpression.expression);
						if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
							symbol = typeChecker.getAliasedSymbol(symbol);
						}
						const declaration = symbol!.getDeclarations()![0];
						if (ts.isImportSpecifier(declaration)) {
							const exportedNode = typeChecker.getExportSpecifierLocalTargetSymbol(declaration.propertyName ?? declaration.name);
							const functionDeclaration = exportedNode!.getDeclarations()![0];
							if (ts.isFunctionDeclaration(functionDeclaration)) {
								Object.assign(docProperties, visitConfigFunctionDeclaration(functionDeclaration, typeChecker)!);
							}
						} else if (ts.isFunctionDeclaration(declaration)) {
							Object.assign(docProperties, visitConfigFunctionDeclaration(declaration, typeChecker)!);
						}
					} else {
						const symbol = typeChecker.getSymbolAtLocation(spreadExpression);
						const declaration = symbol!.getDeclarations()![0];
						if (ts.isVariableDeclaration(declaration)) {
							const initializer = declaration.initializer;
							if (ts.isObjectLiteralExpression(initializer!)) {
								const properties = initializer.properties;
								for (const property of properties) {
									if (ts.isPropertyAssignment(property)) {
										const {name, initializer} = property;
										if (ts.isIdentifier(name)) {
											docProperties[name.text] = initializer.getText() === 'noop' ? '() => {}' : initializer.getText();
										}
									} else {
										throw new Error('Unknow assignement in config');
									}
								}
							}
						}
					}
				}
			}
		}
	}
	if (Object.keys(docProperties).length === 0) {
		throw new Error(`Could not properly compute widget default config from function ${functionDeclaration.name!.getText()}`);
	}
	return docProperties;
}
export const checkDefaultPropsRule = ESLintUtils.RuleCreator.withoutDocs({
	create(context) {
		return {
			FunctionDeclaration(getDefaultValueFnNode: TSESTree.FunctionDeclaration) {
				if (defaultConfigFnregExp.test(getDefaultValueFnNode.id?.name ?? '')) {
					const parserServices = ESLintUtils.getParserServices(context);
					const tsNode: ts.FunctionDeclaration = parserServices.esTreeNodeToTSNodeMap.get(getDefaultValueFnNode);
					const typeChecker = parserServices.program.getTypeChecker();
					const info = visitConfigFunctionDeclaration(tsNode, typeChecker);
					const returnType = typeChecker.getReturnTypeOfSignature(typeChecker.getSignatureFromDeclaration(tsNode)!);
					returnType.getProperties().forEach((prop) => {
						const name = prop.name;
						const actualDefaultValue = info[name];
						const expectedDefaultValueLength = actualDefaultValue === 'undefined' ? 0 : 1;
						const defaultValueItems = prop.getJsDocTags(typeChecker).filter((tag) => tag.name === 'defaultValue');
						let node = getDefaultValueFnNode;
						const propDeclaration = prop.getDeclarations()?.[0];
						if (propDeclaration && propDeclaration.getSourceFile() === tsNode.getSourceFile()) {
							node = parserServices.tsNodeToESTreeNodeMap.get(propDeclaration);
						}
						if (defaultValueItems.length !== expectedDefaultValueLength) {
							if (expectedDefaultValueLength === 0) {
								context.report({
									node,
									messageId: 'expectedNoDefaultValue',
									data: {
										propName: name,
									},
								});
							} else {
								context.report({
									node,
									messageId: 'missingDefaultValue',
									data: {
										propName: name,
										defaultValue: actualDefaultValue,
									},
								});
							}
						} else if (expectedDefaultValueLength > 0) {
							const foundDefaultValueTag =
								defaultValueItems[0].text?.length === 1 && defaultValueItems[0].text?.[0].kind === 'text'
									? defaultValueItems[0].text?.[0].text
									: undefined;
							if (foundDefaultValueTag !== actualDefaultValue) {
								context.report({
									node,
									messageId: 'incorrectDefaultValue',
									data: {
										propName: name,
										defaultValue: actualDefaultValue,
										foundValue: foundDefaultValueTag ?? 'invalid value',
									},
								});
							}
						}
					});
				}
			},
		};
	},
	meta: {
		docs: {
			description: 'Check AgnosUI default props in tsdoc.',
			recommended: 'recommended',
		},
		fixable: 'code',
		messages: {
			missingDefaultValue: 'Missing default value in tsdoc for prop {{ propName }} (should be: {{ defaultValue}})',
			expectedNoDefaultValue: 'Expected no default value in tsdoc for prop {{ propName }}',
			incorrectDefaultValue: 'Mismatching default value in tsdoc for prop {{ propName }}, expected {{ defaultValue}}, found {{ foundValue }}',
		},
		type: 'problem',
		schema: [],
	},
	defaultOptions: [],
});
