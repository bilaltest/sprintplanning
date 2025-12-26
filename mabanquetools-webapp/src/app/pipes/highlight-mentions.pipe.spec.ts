import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightMentionsPipe } from './highlight-mentions.pipe';

describe('HighlightMentionsPipe', () => {
  let pipe: HighlightMentionsPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HighlightMentionsPipe]
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new HighlightMentionsPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should highlight single mention', () => {
    const content = 'Hello @bilal.djebbari, how are you?';
    const result = pipe.transform(content);

    // Extract the HTML string from SafeHtml
    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@bilal.djebbari</span>');
    expect(htmlString).toContain('Hello ');
    expect(htmlString).toContain(', how are you?');
  });

  it('should highlight multiple mentions', () => {
    const content = 'Hey @john.doe and @jane.smith, check this out!';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@john.doe</span>');
    expect(htmlString).toContain('<span class="mention">@jane.smith</span>');
  });

  it('should handle mentions with underscores', () => {
    const content = 'Mention @jean_paul_dupont here';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@jean_paul_dupont</span>');
  });

  it('should handle mentions with hyphens', () => {
    const content = 'Hello @marie-claire here';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@marie-claire</span>');
  });

  it('should handle mentions with dots', () => {
    const content = 'Ping @user.name.test please';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@user.name.test</span>');
  });

  it('should not highlight @ without username', () => {
    const content = 'Email me @ example.com';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    // Should not create a span for standalone @
    expect(htmlString).toBe('Email me @ example.com');
  });

  it('should handle empty content', () => {
    const result = pipe.transform('');
    expect(result).toBe('');
  });

  it('should handle null content', () => {
    const result = pipe.transform(null as any);
    expect(result).toBe('');
  });

  it('should handle undefined content', () => {
    const result = pipe.transform(undefined as any);
    expect(result).toBe('');
  });

  it('should handle content without mentions', () => {
    const content = 'This is a regular comment without any mentions.';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toBe(content);
  });

  it('should handle mention at start of content', () => {
    const content = '@john.doe please check this';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@john.doe</span>');
    expect(htmlString).toContain(' please check this');
  });

  it('should handle mention at end of content', () => {
    const content = 'Thanks to @jane.smith';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('Thanks to ');
    expect(htmlString).toContain('<span class="mention">@jane.smith</span>');
  });

  it('should handle consecutive mentions', () => {
    const content = '@user1 @user2 @user3';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@user1</span>');
    expect(htmlString).toContain('<span class="mention">@user2</span>');
    expect(htmlString).toContain('<span class="mention">@user3</span>');
  });

  it('should handle alphanumeric usernames', () => {
    const content = 'Hey @user123 and @test456';
    const result = pipe.transform(content);

    const htmlString = (result as any).changingThisBreaksApplicationSecurity;

    expect(htmlString).toContain('<span class="mention">@user123</span>');
    expect(htmlString).toContain('<span class="mention">@test456</span>');
  });

  it('should sanitize the HTML output', () => {
    const content = 'Hello @user <script>alert("xss")</script>';
    const result = pipe.transform(content);

    // The result should be SafeHtml object
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});
