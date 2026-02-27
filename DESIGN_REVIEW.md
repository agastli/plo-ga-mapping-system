# Design Review - PLOs-GAs Mapping System

## Review Date: February 27, 2026

### Current Design Strengths
1. ✅ Consistent maroon color theme (#8B1538) aligned with Qatar University branding
2. ✅ Light amber background (amber-50) provides good contrast with white cards
3. ✅ QU logo prominently displayed on all pages
4. ✅ Maroon buttons with white text for primary actions
5. ✅ Consistent header/footer structure across dashboards

### Areas for Improvement

#### 1. **Typography & Readability**
- [ ] Font sizes could be more consistent across pages
- [ ] Line height and letter spacing need optimization for better readability
- [ ] Heading hierarchy (h1, h2, h3) needs clearer visual distinction

#### 2. **Spacing & Layout**
- [ ] Inconsistent padding between cards and sections
- [ ] Some pages have cramped content (need more breathing room)
- [ ] Gap between header and content varies across pages

#### 3. **Button Styling**
- [ ] Mix of button variants (outline, solid) - needs standardization
- [ ] Button sizes inconsistent (some use size="sm", others default)
- [ ] Hover states could be more pronounced

#### 4. **Card Design**
- [ ] Some cards lack visual hierarchy
- [ ] Card shadows inconsistent
- [ ] Card borders could be more subtle

#### 5. **Form Elements**
- [ ] Input field styling could be more refined
- [ ] Label positioning inconsistent
- [ ] Error states need better visual feedback

#### 6. **Navigation**
- [ ] Breadcrumbs missing on deep pages
- [ ] Back buttons inconsistent across pages
- [ ] No clear indication of current page in navigation

#### 7. **Loading States**
- [ ] Loading spinners could be more branded (use maroon color)
- [ ] Skeleton loaders missing on some pages
- [ ] Progress indicators needed for long operations

#### 8. **Empty States**
- [ ] Generic "No data" messages - need illustrations
- [ ] Empty states lack actionable CTAs
- [ ] Could use icons or graphics for better UX

#### 9. **Responsive Design**
- [ ] Mobile menu needs improvement
- [ ] Tables don't scroll well on mobile
- [ ] Some cards stack awkwardly on tablets

#### 10. **Accessibility**
- [ ] Focus indicators could be more visible
- [ ] Color contrast needs verification (WCAG AA)
- [ ] Alt text for images needs review
- [ ] Keyboard navigation could be improved

### Priority Improvements

#### High Priority
1. Standardize button styling across all pages
2. Add breadcrumb navigation for better wayfinding
3. Improve loading states with branded spinners
4. Fix mobile responsiveness issues

#### Medium Priority
5. Enhance empty states with illustrations and CTAs
6. Improve form field styling and error states
7. Add subtle animations for better UX
8. Standardize card shadows and spacing

#### Low Priority
9. Add dark mode support
10. Implement advanced accessibility features
11. Add micro-interactions for delight

### Recommended Design System

#### Colors
- Primary: #8B1538 (Maroon)
- Primary Hover: #6D1028 (Darker Maroon)
- Background: #FFFBEB (Amber-50)
- Card Background: #FFFFFF (White)
- Text Primary: #1F2937 (Gray-800)
- Text Secondary: #6B7280 (Gray-600)
- Border: #E5E7EB (Gray-200)

#### Typography
- Headings: Font weight 700 (bold)
- Body: Font weight 400 (normal)
- Labels: Font weight 500 (medium)
- Line height: 1.5 for body, 1.2 for headings

#### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

#### Border Radius
- sm: 0.375rem (6px)
- md: 0.5rem (8px)
- lg: 0.75rem (12px)

#### Shadows
- sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
- lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
