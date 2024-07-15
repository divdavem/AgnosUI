import type {TSESTree} from '@typescript-eslint/utils';
import {ESLintUtils} from '@typescript-eslint/utils';
import type {ReportFixFunction} from '@typescript-eslint/utils/ts-eslint';
import ts from 'typescript';
import {addIndentation} from './ast-utils';

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

const everythingAfterNonSpaceRegExp = /\S.*$/;
const defaultValueRegExp = /@defaultValue[\s\S]*?(?=@\w+|$)/g;

const createFix = (propDeclaration: ts.Declaration, actualDefaultValue: string | undefined): ReportFixFunction =>
	function* (fixer) {
		const sourceFile = propDeclaration.getSourceFile();
		const text = sourceFile.getText();
		const existingComments = ts.getLeadingCommentRanges(text, propDeclaration.getFullStart());
		let tsDocComment: ts.CommentRange | undefined;
		let tsDocCommentText = '/** */';
		let indent = '';
		for (const comment of existingComments ?? []) {
			if (comment.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
				const commentText = text.substring(comment.pos, comment.end);
				if (commentText.startsWith('/**')) {
					const {character: col} = sourceFile.getLineAndCharacterOfPosition(comment.pos);
					indent = text.substring(comment.pos - col, comment.pos).replace(everythingAfterNonSpaceRegExp, '');
					tsDocComment = comment;
					tsDocCommentText = commentText;
				}
			}
		}
		if (!tsDocComment) {
			const {character: col} = sourceFile.getLineAndCharacterOfPosition(propDeclaration.pos);
			indent = text.substring(propDeclaration.pos - col, propDeclaration.pos).replace(everythingAfterNonSpaceRegExp, '');
		}
		tsDocCommentText = tsDocCommentText.substring(0, tsDocCommentText.length - 1); // removes the ending slash
		tsDocCommentText = tsDocCommentText.replace(defaultValueRegExp, '');
		if (actualDefaultValue) {
			tsDocCommentText = `${tsDocCommentText}\n${indent} * @defaultValue${actualDefaultValue.includes('\n') ? `\n${indent} * ` : ' '}${addIndentation(actualDefaultValue, `${indent} * `)}\n${indent} */`;
		}
		if (tsDocComment) {
			yield fixer.replaceTextRange([tsDocComment.pos, tsDocComment.end], tsDocCommentText);
		} else {
			yield fixer.insertTextBeforeRange([propDeclaration.pos, propDeclaration.pos], tsDocCommentText);
		}
	};

const wrapMarkdown = (value: string) =>
	value.includes('(') || value.includes('\n') || value.length > 25 ? `\`\`\`ts\n${value}\n\`\`\`` : `\`${value}\``;

const markdownRegExp = /^```ts\n([\s\S]*)\n```$|^`(.*)`$/;
const unwrapMarkdown = (value: string) => {
	const match = markdownRegExp.exec(value);
	return match ? (match[1] ?? match[2]) : value;
};

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
						const isUndefined = !actualDefaultValue || actualDefaultValue === 'undefined';
						const expectedDefaultValueLength = isUndefined ? 0 : 1;
						const tsDocActualDefaultValue = isUndefined ? undefined : wrapMarkdown(actualDefaultValue);
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
									fix: propDeclaration && node !== getDefaultValueFnNode ? createFix(propDeclaration, tsDocActualDefaultValue) : undefined,
								});
							} else {
								context.report({
									node,
									messageId: 'missingDefaultValue',
									data: {
										propName: name,
										defaultValue: actualDefaultValue,
									},
									fix: propDeclaration && node !== getDefaultValueFnNode ? createFix(propDeclaration, tsDocActualDefaultValue) : undefined,
								});
							}
						} else if (expectedDefaultValueLength > 0) {
							const foundDefaultValueTag =
								defaultValueItems[0].text?.length === 1 && defaultValueItems[0].text?.[0].kind === 'text'
									? defaultValueItems[0].text?.[0].text
									: undefined;
							if (foundDefaultValueTag !== tsDocActualDefaultValue) {
								context.report({
									node,
									messageId: 'incorrectDefaultValue',
									data: {
										propName: name,
										defaultValue: actualDefaultValue,
										foundValue: foundDefaultValueTag ? unwrapMarkdown(foundDefaultValueTag) : 'invalid value',
									},
									fix: propDeclaration && node !== getDefaultValueFnNode ? createFix(propDeclaration, tsDocActualDefaultValue) : undefined,
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
			incorrectDefaultValue: 'Default value mismatch in tsdoc for prop {{ propName }}, expected {{ defaultValue}}, found {{ foundValue }}',
		},
		type: 'problem',
		schema: [],
	},
	defaultOptions: [],
});
